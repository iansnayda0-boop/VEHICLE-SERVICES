<?php
// Database configuration
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "transport";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Set content type to JSON
header('Content-Type: application/json');

// Check if form is submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get form data
    $customerName = trim($_POST['customerName']);
    $vehicleReg = trim($_POST['vehicleReg']);
    $serviceType = trim($_POST['serviceType']);
    $serviceDate = trim($_POST['serviceDate']);
    $contactNumber = trim($_POST['contactNumber']);
    $mechanicAssigned = trim($_POST['mechanicAssigned']);
    $additionalNotes = trim($_POST['additionalNotes'] ?? '');
    
    // Validate input
    if (empty($customerName) || empty($vehicleReg) || empty($serviceType) || empty($serviceDate) || empty($contactNumber) || empty($mechanicAssigned)) {
        echo json_encode(['success' => false, 'message' => 'All required fields must be filled.']);
        exit;
    }
    
    // Validate date is not in the past
    $selectedDate = strtotime($serviceDate);
    $today = strtotime(date('Y-m-d'));
    if ($selectedDate < $today) {
        echo json_encode(['success' => false, 'message' => 'Service date cannot be in the past.']);
        exit;
    }
    
    // Prepare and bind
    $stmt = $conn->prepare("INSERT INTO service_bookings (customer_name, vehicle_reg, service_type, service_date, contact_number, mechanic_assigned, additional_notes) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssssss", $customerName, $vehicleReg, $serviceType, $serviceDate, $contactNumber, $mechanicAssigned, $additionalNotes);
    
    // Execute the statement
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Booking submitted successfully.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error submitting booking. Please try again.']);
    }
    
    // Close statement and connection
    $stmt->close();
    $conn->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
}
?>