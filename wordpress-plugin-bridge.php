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

    // Set default frontend URL if not set yet.
    if (!get_option('faap_frontend_url')) {
        add_option('faap_frontend_url', 'https://prominencebank.com:9002/');
    }
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

add_filter('rest_pre_serve_request', function($value) {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Authorization, Content-Type');
    return $value;
});

function faap_get_form_config($data) {
    global $wpdb;
    $type = sanitize_text_field($data['type'] ?? 'personal');
    $table_forms = $wpdb->prefix . 'faap_forms';
    $config = $wpdb->get_var($wpdb->prepare("SELECT config FROM $table_forms WHERE form_type = %s", $type));
    if (!$config) {
        return rest_ensure_response([]);
    }

    $decoded = json_decode($config, true);
    if (json_last_error() !== JSON_ERROR_NONE || !is_array($decoded)) {
        return rest_ensure_response([]);
    }
    return rest_ensure_response($decoded);
}

function faap_save_uploaded_file($file, $prefix = 'faap') {
    if (empty($file) || !isset($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
        return null;
    }

    $upload_dir = wp_upload_dir();
    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = sanitize_file_name($prefix . '-' . uniqid() . '.' . $ext);
    $target_path = trailingslashit($upload_dir['path']) . $filename;

    if (move_uploaded_file($file['tmp_name'], $target_path)) {
        return trailingslashit($upload_dir['url']) . $filename;
    }

    return null;
}

function faap_format_label($key) {
    $label = preg_replace('/([a-z])([A-Z])/', '$1 $2', $key);
    $label = str_replace(['_', '-'], ' ', $label);
    return ucwords($label);
}

function faap_build_application_html($submission) {
    $app_id = sanitize_text_field($submission['applicationId'] ?? 'N/A');
    $type_label = ucwords(sanitize_text_field($submission['type'] ?? 'personal'));
    $submitted_at = sanitize_text_field($submission['submittedAt'] ?? date('Y-m-d H:i:s'));

    $data = $submission;
    if (isset($submission['applicationData']) && is_string($submission['applicationData'])) {
        $decoded = json_decode($submission['applicationData'], true);
        if (is_array($decoded)) {
            $data = array_merge($data, $decoded);
        }
    }

    $rows = '';
    $excluded = ['emailSubject', 'emailBody', 'applicationData', 'mainDocumentFile', 'paymentProofFile', 'companyRegFile', 'signatureImage', 'submittedAt', 'status', 'type', 'accountTypeId', 'applicationId'];
    foreach ($data as $key => $value) {
        if (in_array($key, $excluded, true)) {
            continue;
        }
        if (is_array($value)) {
            $value = implode(', ', array_map('esc_html', $value));
        }
        $rows .= '<tr><td style="padding:8px 10px;border:1px solid #e5e7eb;font-weight:600;background:#f9fafb;color:#111827;">' . esc_html(faap_format_label($key)) . '</td><td style="padding:8px 10px;border:1px solid #e5e7eb;color:#111827;">' . esc_html((string)$value) . '</td></tr>';
    }

    $attachments = [];
    if (!empty($submission['mainDocumentFile'])) $attachments[] = $submission['mainDocumentFile'];
    if (!empty($submission['paymentProofFile'])) $attachments[] = $submission['paymentProofFile'];
    if (!empty($submission['companyRegFile'])) $attachments[] = $submission['companyRegFile'];

    $attachmentItems = '';
    foreach ($attachments as $fileUrl) {
        $attachmentItems .= '<li><a href="' . esc_url($fileUrl) . '" target="_blank" rel="noopener" style="color:#2563eb;text-decoration:none;">' . esc_html(basename($fileUrl)) . '</a></li>';
    }
    if (empty($attachmentItems)) {
        $attachmentItems = '<li style="color:#6b7280;">No documents uploaded.</li>';
    }

    $user_name = esc_html($data['fullName'] ?? $data['name'] ?? 'Applicant');
    $user_email = esc_html($data['email'] ?? '');

    return '<div style="font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#f3f4f6;padding:18px;">
      <div style="max-width:720px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
        <div style="background:#0a192f;color:#ffffff;padding:16px 20px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">
          <div>
            <div style="font-size:14px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#c6d2ff;">Prominence Bank</div>
            <div style="font-size:20px;font-weight:800;letter-spacing:0.02em;">Account Application</div>
          </div>
          <div style="text-align:right;font-size:12px;color:#dbeafe;">Secure submission via FAAP portal</div>
        </div>

        <div style="padding:20px;">
          <div style="margin-bottom:16px;">
            <div style="font-size:18px;font-weight:700;color:#111827;">Hello ' . $user_name . ',</div>
            <p style="margin:6px 0 0;color:#4b5563;line-height:1.4;">Your application has been received and is now under compliance review. Below is the submitted form summary.</p>
          </div>

          <div style="background:#f9fafb;border:1px solid #e5e7eb;padding:12px 14px;border-radius:8px;margin-bottom:16px;display:flex;gap:14px;flex-wrap:wrap;">
            <div style="flex:1;min-width:200px;"><div style="font-size:12px;color:#6b7280;">Application ID</div><div style="font-weight:700;color:#111827;">' . esc_html($app_id) . '</div></div>
            <div style="flex:1;min-width:200px;"><div style="font-size:12px;color:#6b7280;">Application Type</div><div style="font-weight:700;color:#111827;">' . esc_html($type_label) . '</div></div>
            <div style="flex:1;min-width:200px;"><div style="font-size:12px;color:#6b7280;">Submitted At</div><div style="font-weight:700;color:#111827;">' . esc_html($submitted_at) . '</div></div>
          </div>

          <div style="margin-bottom:16px;"><div style="font-weight:700;color:#111827;font-size:14px;margin-bottom:8px;">Application Details</div>
            <table style="width:100%;border-collapse:collapse;background:#ffffff;border:1px solid #e5e7eb;">
              ' . $rows . '
            </table>
          </div>

          <div style="margin-bottom:16px;">
            <div style="font-weight:700;color:#111827;font-size:14px;margin-bottom:8px;">Uploaded Documents</div>
            <ul style="margin:0 0 0 18px;padding:0;color:#111827;">' . $attachmentItems . '</ul>
          </div>

          <div style="font-size:12px;color:#6b7280;">If you need support, contact <a href="mailto:support@prominencebank.com" style="color:#2563eb;text-decoration:none;">support@prominencebank.com</a>.</div>
        </div>
      </div>
    </div>';
}

function faap_build_application_pdf_html($submission) {
    $app_id = sanitize_text_field($submission['applicationId'] ?? 'N/A');
    $type_label = ucwords(sanitize_text_field($submission['type'] ?? 'personal'));
    $submitted_at = sanitize_text_field($submission['submittedAt'] ?? date('Y-m-d H:i:s'));

    $data = $submission;
    if (isset($submission['applicationData']) && is_string($submission['applicationData'])) {
        $decoded = json_decode($submission['applicationData'], true);
        if (is_array($decoded)) {
            $data = array_merge($data, $decoded);
        }
    }

    $rows = '';
    $excluded = ['emailSubject', 'emailBody', 'applicationData', 'mainDocumentFile', 'paymentProofFile', 'companyRegFile', 'signatureImage', 'submittedAt', 'status', 'type', 'accountTypeId', 'applicationId'];
    foreach ($data as $key => $value) {
        if (in_array($key, $excluded, true)) {
            continue;
        }
        if (is_array($value)) {
            $value = implode(', ', array_map('esc_html', $value));
        }
        $rows .= '<tr><td style="padding:6px 8px;border:1px solid #ccd0d5;background:#f7f7f7;font-weight:700;width:28%;">' . esc_html(faap_format_label($key)) . '</td><td style="padding:6px 8px;border:1px solid #ccd0d5;">' . esc_html((string)$value) . '</td></tr>';
    }

    $doc_images = [];
    foreach (['mainDocumentFile', 'paymentProofFile', 'companyRegFile'] as $field) {
        if (!empty($submission[$field])) {
            $doc_images[] = esc_url($submission[$field]);
        }
    }

    $images_html = '';
    foreach ($doc_images as $img) {
        $images_html .= '<div style="margin-top:10px;"> <div style="font-weight:600;margin-bottom:4px;">Document</div><img src="' . $img . '" style="width:260px;border:1px solid #e2e8f0;border-radius:6px;" /> </div>';
    }
    if (empty($images_html)) {
        $images_html = '<p style="color:#6b7280;">No image attachments available.</p>';
    }

    return '<html><head><meta charset="utf-8"><style>body{font-family:Arial,Helvetica,sans-serif;color:#111;}.header{background:#0a192f;color:#fff;padding:10px 14px;border-radius:8px 8px 0 0;} .card{border:1px solid #e2e8f0;border-radius:8px;background:#fff;padding:14px;}.details-table{width:100%;border-collapse:collapse;} .details-table td{vertical-align:top;}</style></head><body style="background:#f3f4f6;margin:0;padding:14px;">
      <div class="card">
        <div class="header"><div style="font-size:16px;font-weight:800;">Prominence Bank - Application PDF</div><div style="font-size:11px;margin-top:4px;">Application snapshot for review and compliance</div></div>
        <div style="padding:10px 0;">
          <strong>Application ID:</strong> ' . esc_html($app_id) . '<br>
          <strong>Type:</strong> ' . esc_html($type_label) . '<br>
          <strong>Submitted:</strong> ' . esc_html($submitted_at) . '<br>
        </div>
        <div style="margin-top:10px;"><h3 style="margin-bottom:8px;">Details</h3>
          <table class="details-table">' . $rows . '</table>
        </div>
        <div style="margin-top:16px;"><h3 style="margin-bottom:8px;">Uploaded Documents</h3>' . $images_html . '</div>
      </div>
    </body></html>';
}

function faap_generate_application_pdf($submission) {
    $upload_dir = wp_upload_dir();
    $pdf_path = trailingslashit($upload_dir['path']) . 'faap-app-' . uniqid() . '.pdf';
    $html_file = trailingslashit($upload_dir['path']) . 'faap-app-' . uniqid() . '.html';

    $html_content = faap_build_application_pdf_html($submission);
    file_put_contents($html_file, $html_content);

    $wkhtml = trim(shell_exec('which wkhtmltopdf 2>/dev/null'));
    if ($wkhtml) {
        $escaped = escapeshellarg($wkhtml) . ' --enable-local-file-access ' . escapeshellarg($html_file) . ' ' . escapeshellarg($pdf_path) . ' 2>&1';
        $out = shell_exec($escaped);
        if (file_exists($pdf_path) && filesize($pdf_path) > 0) {
            @unlink($html_file);
            return $pdf_path;
        }
    }

    if (function_exists('proc_open')) {
        $cmd = 'wkhtmltopdf --enable-local-file-access ' . escapeshellarg($html_file) . ' ' . escapeshellarg($pdf_path);
        @exec($cmd, $output, $return);
        if ($return === 0 && file_exists($pdf_path) && filesize($pdf_path) > 0) {
            @unlink($html_file);
            return $pdf_path;
        }
    }

    @unlink($html_file);
    return null;
}

function faap_handle_submission($request) {
    global $wpdb;
    $table_apps = $wpdb->prefix . 'faap_submissions';

    $params = $request->get_json_params();
    if (empty($params) && !empty($_POST)) {
        $params = $_POST;
    }
    if (!is_array($params)) {
        $params = [];
    }

    if (isset($params['applicationData']) && is_string($params['applicationData'])) {
        $decoded = json_decode(stripslashes($params['applicationData']), true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            $params = array_merge($params, $decoded);
        }
    }

    $params['type'] = in_array($params['type'] ?? 'personal', ['personal', 'business'], true) ? $params['type'] : 'personal';
    $params['accountTypeId'] = sanitize_text_field($params['accountTypeId'] ?? '');
    $params['applicationId'] = sanitize_text_field($params['applicationId'] ?? 'APP-' . strtoupper(uniqid()));
    $params['status'] = 'Pending';

    try {
        if (!empty($_FILES['mainDocumentFile'])) {
            $saved = faap_save_uploaded_file($_FILES['mainDocumentFile'], 'main_document');
            if ($saved) {
                $params['mainDocumentFile'] = $saved;
            }
        }
        if (!empty($_FILES['paymentProofFile'])) {
            $saved = faap_save_uploaded_file($_FILES['paymentProofFile'], 'payment_proof');
            if ($saved) {
                $params['paymentProofFile'] = $saved;
            }
        }
        if (!empty($_FILES['companyRegFile'])) {
            $saved = faap_save_uploaded_file($_FILES['companyRegFile'], 'company_reg');
            if ($saved) {
                $params['companyRegFile'] = $saved;
            }
        }

        $form_data_json = wp_json_encode($params);
        $inserted = $wpdb->insert($table_apps, [
            'type' => $params['type'],
            'account_type_id' => $params['accountTypeId'],
            'status' => 'Pending',
            'form_data' => $form_data_json,
        ]);

        if (!$inserted) {
            return new WP_Error('db_err', 'Failed to save application.');
        }

        $email_subject = sanitize_text_field($params['emailSubject'] ?? 'Application Received - Prominence Bank');
        $application_id = sanitize_text_field($params['applicationId']);
        $user_email = sanitize_email($params['email'] ?? $params['signatoryEmail'] ?? '');
        $admin_email = sanitize_email(get_option('admin_email'));
        $type_label = ucwords(sanitize_text_field($params['type'] ?? 'personal'));

        $full_body = faap_build_application_html($params);
        $headers = array('Content-Type: text/html; charset=UTF-8');
        $attachments = [];
        if (!empty($params['mainDocumentFile'])) $attachments[] = $params['mainDocumentFile'];
        if (!empty($params['paymentProofFile'])) $attachments[] = $params['paymentProofFile'];
        if (!empty($params['companyRegFile'])) $attachments[] = $params['companyRegFile'];

        $pdf_attachment = faap_generate_application_pdf($params);
        if ($pdf_attachment && file_exists($pdf_attachment)) {
            $attachments[] = $pdf_attachment;
        }

        if (!empty($user_email)) {
            $user_subject = $email_subject;
            wp_mail($user_email, $user_subject, $full_body, $headers, $attachments);
        }
        $admin_subject = "NEW APPLICATION | " . $application_id . " | " . strtoupper($type_label);
        wp_mail($admin_email, $admin_subject, $full_body, $headers, $attachments);

        return rest_ensure_response(['success' => true, 'id' => $wpdb->insert_id, 'applicationId' => $application_id]);
    } catch (Exception $e) {
        return new WP_Error('submission_error', 'Application submission error: ' . $e->getMessage(), ['status' => 500]);
    }
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

function faap_get_default_form_steps() {
    return [
        [
            'id' => 'step-1',
            'order' => 1,
            'title' => 'Initial Account Details',
            'description' => 'Basic account selection fields',
            'fields' => [
                ['id' => 'f1', 'label' => 'Full Name', 'name' => 'fullName', 'type' => 'text', 'width' => 'full', 'required' => true],
                ['id' => 'f2', 'label' => 'Email', 'name' => 'email', 'type' => 'email', 'width' => 'full', 'required' => true],
            ],
        ],
        [
            'id' => 'step-2',
            'order' => 2,
            'title' => 'Address',
            'description' => 'Contact information',
            'fields' => [
                ['id' => 'f3', 'label' => 'Address', 'name' => 'address', 'type' => 'text', 'width' => 'full', 'required' => true],
            ],
        ],
    ];
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
            $user_body = '<div style="font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:700px;margin:0 auto;padding:18px;background:#f9fafb;">
                <div style="background:#0a192f;color:#fff;padding:16px;border-radius:10px 10px 0 0;">
                  <div style="font-weight:800;font-size:18px;">Payment Verified</div>
                  <div style="margin-top:4px;font-size:12px;color:#d1d5db;">Prominence Bank Application</div>
                </div>
                <div style="background:#fff;border:1px solid #e5e7eb;padding:16px;border-radius:0 0 10px 10px;">
                  <p style="margin:0;color:#111827;">Dear Customer,</p>
                  <p style="margin:10px 0 0;color:#374151;">Your payment has been verified for Application ID: <strong>' . esc_html($application_id) . '</strong>.</p>
                  <p style="margin:10px 0 0;color:#374151;">Your account application is now being processed by our team. We will notify you when the next step is complete.</p>
                  <p style="margin:12px 0 0;color:#6b7280;">Thank you,<br>Prominence Bank Team</p>
                </div>
              </div>';
            wp_mail($user_email, $user_subject, $user_body, $headers);

            // Email to admin
            $admin_subject = "PAYMENT VERIFIED | " . $application_id;
            $admin_body = '<div style="font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:700px;margin:0 auto;padding:18px;background:#f9fafb;">
                <div style="background:#0a192f;color:#fff;padding:16px;border-radius:10px 10px 0 0;">
                  <div style="font-weight:800;font-size:18px;">Payment Verified</div>
                  <div style="margin-top:4px;font-size:12px;color:#d1d5db;">Prominence Bank Admin Alert</div>
                </div>
                <div style="background:#fff;border:1px solid #e5e7eb;padding:16px;border-radius:0 0 10px 10px;">
                  <p style="margin:0;color:#111827;">Payment has been verified for Application ID: <strong>' . esc_html($application_id) . '</strong>.</p>
                  <p style="margin:10px 0 0;color:#374151;">Please continue to process the application in the admin portal.</p>
                </div>
              </div>';
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
    $message = '';
    $message_class = '';

    if (isset($_POST['save_form'])) {
        $config = trim($_POST['form_config']);
        $decoded = json_decode($config, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            $wpdb->replace($table_forms, ['form_type' => $_POST['form_type'], 'config' => $config]);
            $message = 'Form configuration updated successfully.';
            $message_class = 'updated';
        } else {
            $message = 'Invalid JSON. Please fix and save again.';
            $message_class = 'error';
        }
    }

    $personal = $wpdb->get_var($wpdb->prepare("SELECT config FROM $table_forms WHERE form_type = %s", 'personal'));
    $business = $wpdb->get_var($wpdb->prepare("SELECT config FROM $table_forms WHERE form_type = %s", 'business'));

    // Ensure valid JSON for the editor defaults.
    $personalData = json_decode($personal, true);
    if (json_last_error() !== JSON_ERROR_NONE || !is_array($personalData)) {
        $personalData = faap_get_default_form_steps();
    }
    $businessData = json_decode($business, true);
    if (json_last_error() !== JSON_ERROR_NONE || !is_array($businessData)) {
        $businessData = faap_get_default_form_steps();
    }

    $personalJson = json_encode($personalData, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    $businessJson = json_encode($businessData, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    ?>
    <div class="wrap">
        <h1>Manage Form Steps (Visual Editor)</h1>
        <?php if ($message): ?>
            <div class="<?php echo esc_attr($message_class); ?>"><p><?php echo esc_html($message); ?></p></div>
        <?php endif; ?>
        <p>Use this visual editor to add/remove steps and fields. Click Save to persist changes.</p>

        <div style="display:flex;gap:20px;flex-wrap:wrap;">
            <div style="flex:1;min-width:320px;border:1px solid #ccc;padding:12px;border-radius:8px;background:#fff;">
                <h2>Personal Steps</h2>
                <div id="personal-steps" style="margin-bottom:12px;"></div>
                <button id="add-personal-step" class="button button-secondary">+ Add Step</button>
                <form method="post" id="personal-save-form" style="margin-top:12px;">
                    <input type="hidden" name="form_type" value="personal">
                    <input type="hidden" name="form_config" id="personal_form_config">
                    <button type="submit" name="save_form" class="button button-primary">Save Personal</button>
                </form>
            </div>

            <div style="flex:1;min-width:320px;border:1px solid #ccc;padding:12px;border-radius:8px;background:#fff;">
                <h2>Business Steps</h2>
                <div id="business-steps" style="margin-bottom:12px;"></div>
                <button id="add-business-step" class="button button-secondary">+ Add Step</button>
                <form method="post" id="business-save-form" style="margin-top:12px;">
                    <input type="hidden" name="form_type" value="business">
                    <input type="hidden" name="form_config" id="business_form_config">
                    <button type="submit" name="save_form" class="button button-primary">Save Business</button>
                </form>
            </div>
        </div>

        <div style="margin-top:22px;">
            <h3>Raw JSON (for backup)</h3>
            <p style="font-size:12px;color:#555;">The editor stores valid JSON. You can copy this for backup or manual edit.</p>
            <div style="display:flex;gap:20px;flex-wrap:wrap;">
                <textarea id="personal-raw" style="width:100%;min-height:160px;" readonly></textarea>
                <textarea id="business-raw" style="width:100%;min-height:160px;" readonly></textarea>
            </div>
        </div>
    </div>

    <script>
    const personalData = <?php echo json_encode(json_decode($personalJson, true) ?: [], JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT); ?>;
    const businessData = <?php echo json_encode(json_decode($businessJson, true) ?: [], JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT); ?>;

    function createFieldHtml(stepIndex, fieldIndex, field, baseId) {
      return `
        <div class="faap-field" style="border:1px dashed #d5d5d5; padding:8px; margin-bottom:6px; border-radius:6px; background:#f8f8f8;">
          <div style="display:flex;gap:8px; align-items:center; margin-bottom:4px;">
            <small style="font-weight:bold;">Field ${fieldIndex + 1}</small>
            <button type="button" data-remove-field="${stepIndex}:${fieldIndex}" class="button button-link" style="font-size:11px;">Remove</button>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px; margin-bottom:4px;">
            <input type="text" placeholder="label" data-field-label="${stepIndex}:${fieldIndex}" value="${field.label || ''}" style="width:100%;" />
            <input type="text" placeholder="name" data-field-name="${stepIndex}:${fieldIndex}" value="${field.name || ''}" style="width:100%;" />
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px; margin-bottom:4px;">
            <select data-field-type="${stepIndex}:${fieldIndex}" style="width:100%;">
              <option value="text" ${field.type === 'text' ? 'selected' : ''}>text</option>
              <option value="number" ${field.type === 'number' ? 'selected' : ''}>number</option>
              <option value="date" ${field.type === 'date' ? 'selected' : ''}>date</option>
              <option value="select" ${field.type === 'select' ? 'selected' : ''}>select</option>
              <option value="radio" ${field.type === 'radio' ? 'selected' : ''}>radio</option>
              <option value="textarea" ${field.type === 'textarea' ? 'selected' : ''}>textarea</option>
              <option value="email" ${field.type === 'email' ? 'selected' : ''}>email</option>
              <option value="file" ${field.type === 'file' ? 'selected' : ''}>file</option>
            </select>
            <select data-field-width="${stepIndex}:${fieldIndex}" style="width:100%;">
              <option value="full" ${field.width === 'full' ? 'selected' : ''}>full</option>
              <option value="half" ${field.width === 'half' ? 'selected' : ''}>half</option>
            </select>
          </div>
          <div style="display:flex;gap:8px;">
            <label style="font-size:11px;">required <input type="checkbox" data-field-required="${stepIndex}:${fieldIndex}" ${field.required ? 'checked' : ''} /></label>
          </div>
        </div>
      `;
    }

    function renderEditor(data, containerId) {
      const container = document.getElementById(containerId);
      container.innerHTML = '';

      data.forEach((step, stepIndex) => {
        const stepDiv = document.createElement('div');
        stepDiv.style.border = '1px solid #d2d2d2';
        stepDiv.style.padding = '10px';
        stepDiv.style.marginBottom = '10px';
        stepDiv.style.borderRadius = '8px';
        stepDiv.style.background = '#fefefe';

        const stepHeader = document.createElement('div');
        stepHeader.style.display = 'flex';
        stepHeader.style.justifyContent = 'space-between';
        stepHeader.style.alignItems = 'center';
        stepHeader.style.marginBottom = '8px';

        const stepTitle = document.createElement('strong');
        stepTitle.textContent = `Step ${stepIndex + 1}`;

        const removeStep = document.createElement('button');
        removeStep.type = 'button';
        removeStep.textContent = 'Remove Step';
        removeStep.className = 'button button-link';
        removeStep.onclick = () => {
          data.splice(stepIndex, 1);
          renderAll();
        };

        stepHeader.appendChild(stepTitle);
        stepHeader.appendChild(removeStep);

        const stepFields = document.createElement('div');
        stepFields.style.display = 'grid';
        stepFields.style.gridTemplateColumns = '1fr 1fr';
        stepFields.style.gap = '8px';
        stepFields.style.marginBottom = '8px';

        const idInput = document.createElement('input');
        idInput.type = 'text';
        idInput.value = step.id || `step-${stepIndex + 1}`;
        idInput.placeholder = 'id';
        idInput.onchange = (e) => {
          step.id = e.target.value;
          updateRaw();
        };

        const titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.value = step.title || '';
        titleInput.placeholder = 'title';
        titleInput.onchange = (e) => {
          step.title = e.target.value;
          updateRaw();
        };

        const orderInput = document.createElement('input');
        orderInput.type = 'number';
        orderInput.value = step.order || stepIndex + 1;
        orderInput.placeholder = 'order';
        orderInput.onchange = (e) => {
          step.order = Number(e.target.value);
          updateRaw();
        };

        const descInput = document.createElement('input');
        descInput.type = 'text';
        descInput.value = step.description || '';
        descInput.placeholder = 'description';
        descInput.onchange = (e) => {
          step.description = e.target.value;
          updateRaw();
        };

        stepFields.appendChild(idInput);
        stepFields.appendChild(titleInput);
        stepFields.appendChild(orderInput);
        stepFields.appendChild(descInput);

        const fieldsDiv = document.createElement('div');
        fieldsDiv.style.marginBottom = '8px';
        fieldsDiv.innerHTML = '<strong>Fields</strong>';

        (step.fields || []).forEach((field, fieldIndex) => {
          const fieldHtml = document.createElement('div');
          fieldHtml.innerHTML = createFieldHtml(stepIndex, fieldIndex, field, containerId);
          fieldsDiv.appendChild(fieldHtml);
        });

        const addFieldBtn = document.createElement('button');
        addFieldBtn.type = 'button';
        addFieldBtn.className = 'button button-secondary';
        addFieldBtn.textContent = '+ Add Field';
        addFieldBtn.onclick = () => {
          step.fields = step.fields || [];
          step.fields.push({ id: `f-${Date.now()}`, label: 'New field', name: 'newField', type: 'text', width: 'full', required: false });
          renderAll();
        };

        stepDiv.appendChild(stepHeader);
        stepDiv.appendChild(stepFields);
        stepDiv.appendChild(fieldsDiv);
        stepDiv.appendChild(addFieldBtn);

        container.appendChild(stepDiv);
      });

      Array.from(container.querySelectorAll('input[data-field-label],input[data-field-name],select[data-field-type],select[data-field-width],input[data-field-required]')).forEach((input) => {
        input.onchange = () => {
          const [stepIndex, fieldIndex] = input.dataset.fieldLabel?.split(':') || input.dataset.fieldName?.split(':') || input.dataset.fieldType?.split(':') || input.dataset.fieldWidth?.split(':') || input.dataset.fieldRequired?.split(':');
          const step = data[Number(stepIndex)];
          const field = step?.fields?.[Number(fieldIndex)];
          if (!field) return;

          if (input.dataset.fieldLabel) field.label = input.value;
          if (input.dataset.fieldName) field.name = input.value;
          if (input.dataset.fieldType) field.type = input.value;
          if (input.dataset.fieldWidth) field.width = input.value;
          if (input.dataset.fieldRequired) field.required = input.checked;
          updateRaw();
        };
      });

      Array.from(container.querySelectorAll('[data-remove-field]')).forEach((button) => {
        button.addEventListener('click', () => {
          const [stepIndex, fieldIndex] = button.dataset.removeField.split(':').map(Number);
          data[stepIndex].fields.splice(fieldIndex, 1);
          renderAll();
        });
      });

      updateRaw();
    }

    function renderAll() {
      renderEditor(personalData, 'personal-steps');
      renderEditor(businessData, 'business-steps');
      updateRaw();
    }

    function updateRaw() {
      const personalRaw = document.getElementById('personal-raw');
      const businessRaw = document.getElementById('business-raw');
      const personalConfig = document.getElementById('personal_form_config');
      const businessConfig = document.getElementById('business_form_config');
      if (personalRaw) personalRaw.value = JSON.stringify(personalData, null, 2);
      if (businessRaw) businessRaw.value = JSON.stringify(businessData, null, 2);
      if (personalConfig) personalConfig.value = JSON.stringify(personalData, null, 2);
      if (businessConfig) businessConfig.value = JSON.stringify(businessData, null, 2);
    }

    document.getElementById('add-personal-step').addEventListener('click', () => {
      personalData.push({ id: `step-${personalData.length + 1}`, order: personalData.length + 1, title: 'New Step', description: '', fields: [] });
      renderAll();
    });

    document.getElementById('add-business-step').addEventListener('click', () => {
      businessData.push({ id: `step-${businessData.length + 1}`, order: businessData.length + 1, title: 'New Step', description: '', fields: [] });
      renderAll();
    });

    document.getElementById('personal-save-form').addEventListener('submit', () => {
      document.getElementById('personal_form_config').value = JSON.stringify(personalData, null, 2);
    });
    document.getElementById('business-save-form').addEventListener('submit', () => {
      document.getElementById('business_form_config').value = JSON.stringify(businessData, null, 2);
    });

    renderAll();
    </script>
    <?php
}

add_shortcode('financial_form', function($atts) {
    $defaultUrl = 'https://prominencebank.com:9002/';
    // Accept custom URL via shortcode [financial_form url="..."] for testing.
    $url = isset($atts['url']) ? esc_url_raw($atts['url']) : get_option('faap_frontend_url', $defaultUrl);
    if (empty($url)) {
        $url = $defaultUrl;
    }
    return "<div class='faap-container' style='background:#f4f7f9; padding:10px;'>
        <iframe src='" . esc_url($url) . "' style='width:100%; height:1200px; border:none; box-shadow: 0 10px 30px rgba(0,0,0,0.1);' allow='payment'></iframe>
    </div>";
});
