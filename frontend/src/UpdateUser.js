import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import styles from "./UpdateUser.module.css";

export default function UpdateUser() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [values, setValues] = useState(location.state?.user || {
    id: "",
    fname: "",
    lname: "",
    email: "",
  });

  useEffect(() => {
    if (!location.state?.user) {
      axios
        .get(`http://localhost:8081/user/${id}`)
        .then(res => {
          if (res.data.success) setValues(res.data.user);
        })
        .catch(err => console.log(err));
    }
  }, [id, location.state]);

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .put(`http://localhost:8081/update/${id}`, values)
      .then(res => {
        if (res.data.success) {
          alert(res.data.message);
          navigate("/"); // Redirect to main page after update
        } else {
          alert(res.data.message);
        }
      })
      .catch(err => console.log(err));
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.formCard}>
        <h2>Update User</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="ID" value={values.id} readOnly className={styles.formControl} />
          <input
            type="text"
            placeholder="First Name"
            value={values.fname}
            className={styles.formControl}
            onChange={e => setValues({ ...values, fname: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            value={values.lname}
            className={styles.formControl}
            onChange={e => setValues({ ...values, lname: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={values.email}
            className={styles.formControl}
            onChange={e => setValues({ ...values, email: e.target.value })}
            required
          />
          <button type="submit" className={styles.btnSubmit}>Update</button>
        </form>
      </div>
    </div>
  );
}