# ACCIONLABSPROJECT

This is a full-stack secure file upload web application built with Node.js and React, containerized using Docker. The backend handles file operations and AWS S3 integration, while the frontend provides a responsive user interface for uploading files.




ACCIONLABSPROJECT/
│
├── backend/
│ ├── db/
│ ├── node_modules/
│ ├── routes/
│ ├── .env
│ ├── docker-compose.yml
│ ├── Dockerfile
│ ├── package-lock.json
│ ├── package.json
│ └── server.js
│
├── frontend/
│ ├── node_modules/
│ ├── public/
│ │ └── index.html
│ ├── src/
│ │ ├── components/
│ │ ├── pages/
│ │ ├── App.js
│ │ ├── index.css
│ │ └── index.js
│ ├── docker-compose.yml
│ ├── Dockerfile
│ ├── package-lock.json
│ └── package.json
│
└── docker-compose.yml # Root-level for orchestrating both frontend and backend
