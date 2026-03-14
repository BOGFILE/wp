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

function faap_get_form_config($data) {
    global $wpdb;
    $type = $data['type'];
    $table_forms = $wpdb->prefix . 'faap_forms';
    $config = $wpdb->get_var($wpdb->prepare("SELECT config FROM $table_forms WHERE form_type = %s", $type));
    return $config ? json_decode($config) : [];
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

function faap_build_application_html($submission) {
    $app_id = $submission['applicationId'] ?? 'N/A';
    $type = ucfirst($submission['type'] ?? 'personal');
    $applicationType = $submission['type'] ?? 'personal';
    $safeRows = '';

    $data = $submission;
    if (isset($submission['applicationData']) && is_string($submission['applicationData'])) {
        $decoded = json_decode($submission['applicationData'], true);
        if (is_array($decoded)) {
            $data = array_merge($data, $decoded);
        }
    }

    foreach ($data as $key => $value) {
        if (in_array($key, ['emailSubject', 'emailBody', 'applicationData', 'mainDocumentFile', 'paymentProofFile', 'companyRegFile', 'signatureImage'], true)) {
            continue;
        }
        if (is_array($value)) {
            $value = json_encode($value, JSON_PRETTY_PRINT);
        }
        $safeRows .= '<tr><td style="padding:6px;border:1px solid #ddd;font-weight:bold;">' . esc_html($key) . '</td><td style="padding:6px;border:1px solid #ddd;">' . esc_html((string)$value) . '</td></tr>'; 
    }

    $attachments = [];
    if (!empty($submission['mainDocumentFile'])) {
        $attachments[] = $submission['mainDocumentFile'];
    }
    if (!empty($submission['paymentProofFile'])) {
        $attachments[] = $submission['paymentProofFile'];
    }
    if (!empty($submission['companyRegFile'])) {
        $attachments[] = $submission['companyRegFile'];
    }

    $attachmentHtml = '';
    foreach ($attachments as $fileUrl) {
        $attachmentHtml .= '<li><a href="' . esc_url($fileUrl) . '" target="_blank" rel="noopener">' . esc_html(basename($fileUrl)) . '</a></li>';
    }

    return '<div style="font-family:Arial,Helvetica,sans-serif;max-width:700px;margin:0 auto;color:#1f2937;line-height:1.5;">
      <h2>Application Confirmation</h2>
      <p>Application ID: <strong>' . esc_html($app_id) . '</strong></p>
      <p>Application Type: <strong>' . esc_html($type) . '</strong></p>
      <h3>Full Application Details</h3>
      <table style="border-collapse:collapse;width:100%;margin-bottom:12px;">' . $safeRows . '</table>
      <h3>Uploaded Documents</h3>
      <ul>' . ($attachmentHtml ?: '<li>No documents uploaded.</li>') . '</ul>
      <p style="font-size:12px;color:#6b7280;">If links are not clickable, copy/paste into browser.</p>
    </div>';
}

function faap_handle_submission($request) {
    global $wpdb;
    $table_apps = $wpdb->prefix . 'faap_submissions';

    $params = $request->get_json_params();
    if (empty($params) && !empty($_POST)) {
        $params = $_POST;
        if (isset($_POST['applicationData'])) {
            $decoded = json_decode(stripslashes($_POST['applicationData']), true);
            if (is_array($decoded)) {
                $params = array_merge($params, $decoded);
            }
        }
    }
    if (!is_array($params)) {
        $params = [];
    }

    $params['type'] = $params['type'] ?? 'personal';
    $params['accountTypeId'] = $params['accountTypeId'] ?? '';
    $params['applicationId'] = $params['applicationId'] ?? 'APP-' . strtoupper(uniqid());
    $params['status'] = 'Pending';

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

    $form_data_json = json_encode($params);
    $result = $wpdb->insert($table_apps, [
        'type' => $params['type'],
        'account_type_id' => $params['accountTypeId'],
        'status' => 'Pending',
        'form_data' => $form_data_json,
    ]);

    $email_subject = $params['emailSubject'] ?? 'Application Received - Prominence Bank';
    $application_id = $params['applicationId'];
    $user_email = $params['email'] ?? $params['signatoryEmail'] ?? '';
    $admin_email = get_option('admin_email');

    $full_body = faap_build_application_html($params);
    $headers = array('Content-Type: text/html; charset=UTF-8');
    $attachments = [];
    if (!empty($params['mainDocumentFile'])) $attachments[] = $params['mainDocumentFile'];
    if (!empty($params['paymentProofFile'])) $attachments[] = $params['paymentProofFile'];
    if (!empty($params['companyRegFile'])) $attachments[] = $params['companyRegFile'];

    if (!empty($user_email)) {
        wp_mail($user_email, $email_subject, $full_body, $headers, $attachments);
    }
    wp_mail($admin_email, "NEW APPLICATION: " . $application_id, $full_body, $headers, $attachments);

    if ($result) {
        return ['success' => true, 'id' => $wpdb->insert_id, 'applicationId' => $application_id];
    }

    return new WP_Error('db_err', 'Failed to save application');
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
        $personalData = [];
    }
    $businessData = json_decode($business, true);
    if (json_last_error() !== JSON_ERROR_NONE || !is_array($businessData)) {
        $businessData = [];
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
