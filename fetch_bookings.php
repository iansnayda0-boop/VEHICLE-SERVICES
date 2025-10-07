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

// Function to generate status badge
function generateStatusBadge($status) {
    $statusClass = '';
    switch ($status) {
        case 'Pending':
            $statusClass = 'status-pending';
            break;
        case 'In Progress':
            $statusClass = 'status-in-progress';
            break;
        case 'Completed':
            $statusClass = 'status-completed';
            break;
        default:
            $statusClass = 'status-pending';
    }
    
    return '<div class="booking-status ' . $statusClass . '">' . htmlspecialchars($status) . '</div>';
}

// Function to format date
function formatDate($dateString) {
    return date("F j, Y", strtotime($dateString));
}

// Fetch all bookings from database
$sql = "SELECT * FROM service_bookings ORDER BY created_at DESC";
$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
    // Output data of each row
    while($row = $result->fetch_assoc()) {
        $customerName = htmlspecialchars($row["customer_name"]);
        $vehicleReg = htmlspecialchars($row["vehicle_reg"]);
        $serviceType = htmlspecialchars($row["service_type"]);
        $serviceDate = formatDate($row["service_date"]);
        $contactNumber = htmlspecialchars($row["contact_number"]);
        $mechanicAssigned = htmlspecialchars($row["mechanic_assigned"]);
        $additionalNotes = htmlspecialchars($row["additional_notes"] ?? '');
        $status = $row["status"] ?? 'Pending';
        
        $statusBadge = generateStatusBadge($status);
        
        echo '
        <div class="booking-card">
            <div class="booking-header">
                <div class="booking-customer">
                    <h4>' . $customerName . '</h4>
                    <p>' . $vehicleReg . '</p>
                </div>
                ' . $statusBadge . '
            </div>
            
            <div class="booking-details">
                <div class="detail-item">
                    <span class="detail-label">Service Type</span>
                    <span class="detail-value">' . $serviceType . '</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Service Date</span>
                    <span class="detail-value">' . $serviceDate . '</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Contact</span>
                    <span class="detail-value">' . $contactNumber . '</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Mechanic</span>
                    <span class="detail-value">' . $mechanicAssigned . '</span>
                </div>
            </div>';
            
        if (!empty($additionalNotes)) {
            echo '
            <div class="booking-notes">
                <strong>Notes:</strong> ' . nl2br($additionalNotes) . '
            </div>';
        }
            
        echo '</div>';
    }
} else {
    echo '
    <div class="no-bookings">
        <i class="fas fa-calendar-times"></i>
        <p>No bookings found. Schedule your first service!</p>
    </div>';
}

$conn->close();
?>