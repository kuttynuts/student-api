// CI/CD demonstration - Student API
const express = require("express");

const app = express();
app.use(express.json());

let students = [
  { id: 594, name: "Shalini", age: 21, department: "CSE" },
  { id: 402, name: "Varun", age: 20, department: "ECE" },
  { id: 503, name: "Sneha", age: 22, department: "CSE" }
];

// GET: Retrieve all students
app.get("/students", (req, res) => {
  res.status(200).json(students);
});

// GET: Retrieve a student by ID
app.get("/students/:id", (req, res) => {
  const id = Number(req.params.id);
  const student = students.find(s => s.id === id);

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  res.status(200).json(student);
});

// POST: Add a new student
app.post("/students", (req, res) => {
  const { name, age, department } = req.body;

  if (!name || age === undefined || !department ||
      !Number.isInteger(Number(age)) || Number(age) <= 0) {
    return res.status(400).json({
      message: "Provide a valid name, positive age and department"
    });
  }

  const newId = students.length
    ? Math.max(...students.map(s => s.id)) + 1
    : 101;

  const student = {
    id: newId,
    name,
    age: Number(age),
    department
  };

  students.push(student);
  res.status(201).json(student);
});

// PATCH: Update selected student fields
app.patch("/students/:id", (req, res) => {
  const id = Number(req.params.id);
  const student = students.find(s => s.id === id);

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  const { name, age, department } = req.body;

  if (
    (name !== undefined && (typeof name !== "string" || !name.trim())) ||
    (department !== undefined &&
      (typeof department !== "string" || !department.trim())) ||
    (age !== undefined &&
      (!Number.isInteger(Number(age)) || Number(age) <= 0))
  ) {
    return res.status(400).json({ message: "Invalid update data" });
  }

  if (name !== undefined) student.name = name;
  if (age !== undefined) student.age = Number(age);
  if (department !== undefined) student.department = department;

  res.status(200).json(student);
});

// DELETE: Remove a student
app.delete("/students/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = students.findIndex(s => s.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Student not found" });
  }

  students.splice(index, 1);
  res.status(200).json({ message: "Student deleted successfully" });
});

// Start the server
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Student API running at http://localhost:${PORT}`);
});