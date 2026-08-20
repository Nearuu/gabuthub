<?php
$mysqli = new mysqli("127.0.0.1", "root", "", "entertainment_hub");
$res = $mysqli->query("SELECT id, username, email, role, password FROM users");
$users = [];
while ($u = $res->fetch_assoc()) {
    $users[] = $u;
}
echo json_encode($users, JSON_PRETTY_PRINT);
