import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import styles from "./CustomerDetails.module.css";
export default function CustomerDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = useState(location.state?.user || null);
  const [loading, setLoading] = useState(!user);

  useEffect(() => {
    if (!user && id) {
      axios
        .get(`http://localhost:8081/user/${id}`)
        .then((res) => {
          if (res.data.success) {
            setUser(res.data.user);
            setLoading(false);
          } else {
            alert(res.data.message);
            navigate("/");
          }
        })
        .catch(() => navigate("/"));
    }
  }, [user, id, navigate]);

  if (loading) return <p style={{ textAlign: "center", marginTop: "50px", fontSize: "1.2rem", color: "#fff" }}>Loading user details...</p>;
  if (!user) return null;

  const deleteCustomer = () => {
    if (window.confirm("Are you sure you want to delete your account?")) {
      axios
        .delete(`http://localhost:8081/delete/${id}`)
        .then(() => {
          alert("Customer Deleted Successfully");
          navigate("/");
        })
        .catch((err) => console.log(err));
    }
  };

  return (
    <div className={styles.detailsContainer}>
      <div className={styles.detailsCard}>
        <h2>Customer Details</h2>
        <p><strong>ID:</strong> {user.id}</p>
        <p><strong>First Name:</strong> {user.fname}</p>
        <p><strong>Last Name:</strong> {user.lname}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Phone:</strong> {user.phone}</p>

        <div className={styles.buttonGroup}>
          <button
            onClick={() => navigate(`/update/${user.id}`, { state: { user } })}
            className={`${styles.btnSubmit} ${styles.btnUpdate}`}
          >
            Update Details
          </button>

          <button
            onClick={deleteCustomer}
            className={`${styles.btnSubmit} ${styles.btnDelete}`}
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}