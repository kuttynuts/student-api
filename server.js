
const express = require('express');
const client = require('prom-client');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ================================
// PROMETHEUS CONFIGURATION
// ================================

const register = new client.Registry();

client.collectDefaultMetrics({
  register,
  prefix: 'student_api_'
});

// Total HTTP requests counter
const httpRequestsTotal = new client.Counter({
  name: 'student_api_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

// HTTP request duration histogram
const httpRequestDuration = new client.Histogram({
  name: 'student_api_http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

// Request monitoring middleware
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    if (req.path === '/metrics') return;

    const route = req.route ? req.route.path : req.path;

    const labels = {
      method: req.method,
      route: route,
      status_code: res.statusCode.toString()
    };

    httpRequestsTotal.inc(labels);

    httpRequestDuration.observe(
      labels,
      (Date.now() - start) / 1000
    );

    console.log(
      `${req.method} ${req.path} ${res.statusCode}`
    );
  });

  next();
});

// ================================
// STUDENT DATA
// ================================

let students = [
  { id: 594, name: 'Shalini', age: 21, department: 'CSE' },
  { id: 402, name: 'Varun', age: 20, department: 'ECE' },
  { id: 503, name: 'Sneha', age: 22, department: 'CSE' }
];

// ================================
// HEALTH CHECK
// ================================

app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    message: 'Student API is running'
  });
});

// ================================
// PROMETHEUS METRICS ENDPOINT
// ================================

app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// ================================
// GET ALL STUDENTS
// ================================

app.get('/students', (req, res) => {
  res.json(students);
});

// ================================
// GET STUDENT BY ID
// ================================

app.get('/students/:id', (req, res) => {
  const id = Number(req.params.id);

  const student = students.find(s => s.id === id);

  if (!student) {
    return res.status(404).json({
      message: 'Student not found'
    });
  }

  res.json(student);
});

// ================================
// ADD NEW STUDENT
// ================================

app.post('/students', (req, res) => {
  const { id, name, age, department } = req.body;

  if (!id || !name || !age || !department) {
    return res.status(400).json({
      message: 'Please provide all student details'
    });
  }

  if (students.some(s => s.id === Number(id))) {
    return res.status(409).json({
      message: 'Student ID already exists'
    });
  }

  const newStudent = {
    id: Number(id),
    name,
    age: Number(age),
    department
  };

  students.push(newStudent);

  res.status(201).json({
    message: 'Student added successfully',
    student: newStudent
  });
});

// ================================
// UPDATE STUDENT
// ================================

app.patch('/students/:id', (req, res) => {
  const id = Number(req.params.id);

  const student = students.find(s => s.id === id);

  if (!student) {
    return res.status(404).json({
      message: 'Student not found'
    });
  }

  Object.assign(student, req.body);

  res.json({
    message: 'Student updated successfully',
    student
  });
});

// ================================
// DELETE STUDENT
// ================================

app.delete('/students/:id', (req, res) => {
  const id = Number(req.params.id);

  const index = students.findIndex(s => s.id === id);

  if (index === -1) {
    return res.status(404).json({
      message: 'Student not found'
    });
  }

  const deletedStudent = students.splice(index, 1);

  res.json({
    message: 'Student deleted successfully',
    student: deletedStudent[0]
  });
});

// ================================
// SERVER
// ================================

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Student API running on port ${PORT}`);
  console.log(`Metrics available at /metrics`);
});
