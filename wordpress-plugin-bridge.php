<?php
/**
 * Plugin Name: Financial Account Application Portal
 * Description: Secure Account Application portal with Admin Management and AI Email Notifications.
 * Version: 5.5
 * Author: AccountSelectr
 */

// 1. Database Setup
register_activation_hook(__FILE__, 'faap_setup_database');
function faap_setup_database() {
    global $wpdb;
    $charset_collate = $wpdb->get_charset_collate();

    $table_apps = $wpdb->prefix . 'faap_submissions';
    $sql_apps = "CREATE TABLE IF NOT EXISTS $table_apps (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type ENUM('personal', 'business') NOT NULL,
        account_type_id VARCHAR(100),
        status VARCHAR(50) DEFAULT 'Pending',
        form_data LONGTEXT,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) $charset_collate;";

    $table_forms = $wpdb->prefix . 'faap_forms';
    $sql_forms = "CREATE TABLE IF NOT EXISTS $table_forms (
        id INT AUTO_INCREMENT PRIMARY KEY,
        form_type VARCHAR(50) UNIQUE,
        config LONGTEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) $charset_collate;";

    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql_apps);
    dbDelta($sql_forms);
}

// 2. REST API Endpoints
add_action('rest_api_init', function () {
    register_rest_route('faap/v1', '/form-config/(?P<type>[a-zA-Z0-9-]+)', array(
        'methods' => 'GET',
        'callback' => 'faap_get_form_config',
        'permission_callback' => '__return_true',
    ));
    register_rest_route('faap/v1', '/submit', array(
        'methods' => 'POST',
        'callback' => 'faap_handle_submission',
        'permission_callback' => '__return_true',
    ));
    register_rest_route('faap/v1', '/applications', array(
        'methods' => 'GET',
        'callback' => 'faap_get_applications',
        'permission_callback' => '__return_true',
    ));
    register_rest_route('faap/v1', '/applications/(?P<id>\d+)/payment-verified', array(
        'methods' => 'POST',
        'callback' => 'faap_verify_payment',
        'permission_callback' => '__return_true',
    ));
});

function faap_get_form_config($data) {
    global $wpdb;
    $type = $data['type'];
    $table_forms = $wpdb->prefix . 'faap_forms';
    $config = $wpdb->get_var($wpdb->prepare("SELECT config FROM $table_forms WHERE form_type = %s", $type));
    return $config ? json_decode($config) : [];
}

function faap_handle_submission($request) {
    global $wpdb;
    $params = $request->get_json_params();
    $table_apps = $wpdb->prefix . 'faap_submissions';
    
    // 1. Store in Database
    $result = $wpdb->insert($table_apps, [
        'type' => $params['type'] ?? 'personal',
        'account_type_id' => $params['accountTypeId'] ?? '',
        'status' => 'Pending',
        'form_data' => json_encode($params)
    ]);

    // 2. Extract AI generated Email Content
    $email_subject = $params['emailSubject'] ?? 'Application Received - Prominence Bank';
    $email_body = $params['emailBody'] ?? '';
    $application_id = $params['applicationId'] ?? 'N/A';
    
    // 3. Find User Email
    $user_email = '';
    if (isset($params['email'])) {
        $user_email = $params['email'];
    } elseif (isset($params['signatoryEmail'])) {
        $user_email = $params['signatoryEmail'];
    }

    // 4. Send Emails if content is present
    if ($email_body && !empty($user_email)) {
        $headers = array('Content-Type: text/html; charset=UTF-8');
        $admin_email = get_option('admin_email');

        // Modify email body to include Application ID
        $user_email_body = str_replace('Application Reference ID', 'Application Reference ID: ' . $application_id, $email_body);
        $admin_email_body = $user_email_body . '<br><br><strong>Admin Note:</strong> New application submitted. Application ID: ' . $application_id;

        // Send to User
        wp_mail($user_email, $email_subject, $user_email_body, $headers);
        
        // Send to Admin
        $admin_subject = "NEW SUBMISSION - ID: " . $application_id . " - " . $email_subject;
        wp_mail($admin_email, $admin_subject, $admin_email_body, $headers);
    }

    return $result ? ['success' => true, 'id' => $wpdb->insert_id, 'applicationId' => $application_id] : new WP_Error('db_err', 'Failed to save');
}

function faap_get_applications() {
    global $wpdb;
    $table_apps = $wpdb->prefix . 'faap_submissions';
    
    $applications = $wpdb->get_results("SELECT * FROM $table_apps ORDER BY submitted_at DESC", ARRAY_A);
    
    // Format the data for the admin dashboard
    $formatted_apps = array_map(function($app) {
        $form_data = json_decode($app['form_data'], true);
        return [
            'id' => $app['id'],
            'type' => $app['type'],
            'accountTypeId' => $app['account_type_id'],
            'status' => $app['status'],
            'submittedAt' => $app['submitted_at'],
            'applicationId' => $form_data['applicationId'] ?? 'N/A',
            'formData' => $form_data
        ];
    }, $applications);
    
    return $formatted_apps;
}

function faap_verify_payment($request) {
    global $wpdb;
    $app_id = $request->get_param('id');
    $table_apps = $wpdb->prefix . 'faap_submissions';
    
    // Update status to verified
    $result = $wpdb->update($table_apps, ['status' => 'Payment Verified'], ['id' => $app_id]);
    
    if ($result) {
        // Get application data for email
        $app = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_apps WHERE id = %d", $app_id), ARRAY_A);
        $form_data = json_decode($app['form_data'], true);
        $application_id = $form_data['applicationId'] ?? 'N/A';
        $user_email = $form_data['email'] ?? $form_data['signatoryEmail'] ?? '';
        
        // Send notification emails
        if (!empty($user_email)) {
            $headers = array('Content-Type: text/html; charset=UTF-8');
            $admin_email = get_option('admin_email');
            
            // Email to user
            $user_subject = "Payment Verified - Application ID: " . $application_id;
            $user_body = "Dear Customer,<br><br>Your payment has been verified for Application ID: <strong>" . $application_id . "</strong>.<br><br>Your application is now being processed.<br><br>Best regards,<br>Prominence Bank Team";
            wp_mail($user_email, $user_subject, $user_body, $headers);
            
            // Email to admin
            $admin_subject = "PAYMENT VERIFIED - Application ID: " . $application_id;
            $admin_body = "Payment has been verified for Application ID: <strong>" . $application_id . "</strong>.<br><br>Application is ready for final processing.";
            wp_mail($admin_email, $admin_subject, $admin_body, $headers);
        }
        
        return ['success' => true, 'message' => 'Payment verified successfully'];
    }
    
    return new WP_Error('update_err', 'Failed to verify payment');
}

// 3. Admin Menu
add_action('admin_menu', function() {
    add_menu_page('Financial Portal', 'Financial Portal', 'manage_options', 'faap-admin', 'faap_admin_submissions', 'dashicons-bank', 30);
    add_submenu_page('faap-admin', 'Submissions', 'Submissions', 'manage_options', 'faap-admin', 'faap_admin_submissions');
    add_submenu_page('faap-admin', 'Manage Forms', 'Manage Forms', 'manage_options', 'faap-manage-forms', 'faap_admin_manage_forms');
});

function faap_admin_submissions() {
    global $wpdb;
    $table_apps = $wpdb->prefix . 'faap_submissions';
    $rows = $wpdb->get_results("SELECT * FROM $table_apps ORDER BY submitted_at DESC");
    ?>
    <div class="wrap">
        <h1 style="font-family: 'Alegreya', serif; color: #0a192f;">Application Submissions</h1>
        <hr />
        <table class="wp-list-table widefat fixed striped">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Account Type</th>
                    <th>Status</th>
                    <th>Details</th>
                </tr>
            </thead>
            <tbody>
                <?php if ($rows): foreach($rows as $row): ?>
                <tr>
                    <td><?php echo $row->submitted_at; ?></td>
                    <td><span style="background:#0a192f; color:#fff; padding:3px 10px; border-radius:3px; font-size:10px; font-weight:bold;"><?php echo strtoupper($row->type); ?></span></td>
                    <td><?php echo esc_html($row->account_type_id); ?></td>
                    <td><span style="color: #c29d45; font-weight: bold;"><?php echo esc_html($row->status); ?></span></td>
                    <td>
                        <button class="button" onclick='const data = <?php echo $row->form_data; ?>; console.log(data); alert("Application data logged to console.");'>View Payload</button>
                    </td>
                </tr>
                <?php endforeach; else: ?>
                <tr><td colspan="5">No applications received yet.</td></tr>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
    <?php
}

function faap_admin_manage_forms() {
    global $wpdb;
    $table_forms = $wpdb->prefix . 'faap_forms';
    if (isset($_POST['save_form'])) {
        $wpdb->replace($table_forms, ['form_type' => $_POST['form_type'], 'config' => $_POST['form_config']]);
        echo '<div class="updated"><p>Form configuration updated.</p></div>';
    }
    $personal = $wpdb->get_var("SELECT config FROM $table_forms WHERE form_type = 'personal'");
    $business = $wpdb->get_var("SELECT config FROM $table_forms WHERE form_type = 'business'");
    ?>
    <div class="wrap">
        <h1>Manage Form JSON</h1>
        <form method="post">
            <input type="hidden" name="form_type" value="personal">
            <h3>Personal Configuration</h3>
            <textarea name="form_config" style="width:100%; height:200px;"><?php echo esc_textarea($personal); ?></textarea>
            <p><input type="submit" name="save_form" class="button button-primary" value="Save Personal"></p>
        </form>
        <form method="post">
            <input type="hidden" name="form_type" value="business">
            <h3>Business Configuration</h3>
            <textarea name="form_config" style="width:100%; height:200px;"><?php echo esc_textarea($business); ?></textarea>
            <p><input type="submit" name="save_form" class="button button-primary" value="Save Business"></p>
        </form>
    </div>
    <?php
}

add_shortcode('financial_form', function($atts) {
    $url = 'http://3.14.204.157:9002/';
    return "<div class='faap-container' style='background:#f4f7f9; padding:10px;'>
        <iframe src='$url' style='width:100%; height:1200px; border:none; box-shadow: 0 10px 30px rgba(0,0,0,0.1);' allow='payment'></iframe>
    </div>";
});
