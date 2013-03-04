<html>
<?php
    include 'templates/head.php';
    include 'templates/navbar.php';
    require_once 'functions/user.php';
?>
<body>
<div class="well ds-component ds-hover container-narrow" data-componentid="well1">
<div class="ds-component ds-hover" data-componentid="content2">
<?php
    if (empty($_POST)) {
        html_respond('Error!', 'Registration information not specified.');
    } else {
        $user_data = array();
        $required = array(
            'register-email' => 'email_address',
            'register-password' => 'password',
            'register-first-name' => 'first_name',
            'register-last-name' => 'last_name',
            'register-gender' => 'gender');

        // Make sure all required fields are defined
        $missing_fields = array();
        foreach ($required as $post_key => $db_key) {
            if (empty($_POST[$post_key])) {
                $missing_fields[] = $post_key;
            } else {
                $user_data[$db_key] = sanitize_string($_POST[$post_key]);
            }
        }

        // Copy over non-required fields
        $user_data['drivers_license_id'] = sanitize_string($_POST['register-drivers-license-id']);

        if ($missing_fields) {
            html_respond('Error!', 'Missing fields: ' . implode(', ', $missing_fields));
        } else {
            add_user($user_data);
            html_respond('Success!', 'You have successfully registered for Easy Ride!');
        }
    }
?>
</div>
</div>
<?php include 'templates/footer.php'; ?>
</body>
</html>