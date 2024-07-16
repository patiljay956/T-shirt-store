# T-Shirt Store

Welcome to the T-Shirt Store project! This is a back-end focused project that aims to create an online store for selling t-shirts.

## Table of Contents

-   [T-Shirt Store](#t-shirt-store)
    -   [Table of Contents](#table-of-contents)
    -   [Introduction](#introduction)
    -   [Features](#features)
    -   [Installation](#installation)
    -   [Usage](#usage)
    -   [Contributing](#contributing)
    -   [License](#license)
    -   [Setup and Environment](#setup-and-environment)

## Introduction

The T-Shirt Store project is built using [Node.js](https://nodejs.org/) and [Express.js](https://expressjs.com/) MongoDB. It provides a RESTful API for managing t-shirts, including functionalities like creating, updating, and deleting t-shirts.
additionally, it also provides user authentication and authorization, shopping cart functionality, and order management.

## Features

-   User authentication and authorization
-   CRUD operations for t-shirts
-   Search and filtering options
-   Shopping cart functionality
-   Order management

## Installation

To get started with the T-Shirt Store project, follow these steps:

1. Clone the repository: `git clone https://github.com/your-username/tshirt-store.git`
2. Install the dependencies: `npm install`
3. Set up the database connection in the `.env` file
4. Run the application: `npm start`

## Usage

Once the application is up and running, you can access the API endpoints using tools like [Postman](https://www.postman.com/) or [curl](https://curl.se/). Refer to the API documentation for detailed information on each endpoint.

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request. Make sure to follow the [code of conduct](CONTRIBUTING.md) when contributing to this project.

## License

This project is licensed under the [MIT License](LICENSE).

## Setup and Environment

To set up this project locally, follow these steps:

1.  Clone the repository to your local machine:

    ```bash
    git clone https://github.com/your-username/tshirt-store.git
    ```

2.  Install the required dependencies:

    ```bash
    npm install
    ```

3.  Navigate into the project directory:

    ```bash
    cd tshirt-store
    ```

4.  Create a `.env` file in the root directory and add the necessary environment variables as specified in the `below` file.

```plaintext
       PORT=
       CORS=
       DB_URL=

       JWT_SECRET=
       JWT_EXPIRY=

       CLOUDINARY_NAME=
       CLOUDINARY_KEY=
       CLOUDINARY_SECRET=

       SMTP_HOST=
       SMTP_PORT=
       SMTP_USER=
       SMTP_PASS=

       STRIPE_PUBLIC_KEY=
       STRIPE_SECRET_KEY=

```

4. Run the Application:

```bash :
npm start
```

5. The application will be running at `http://localhost:3000/`.

credits: Part of Pro Backend Developer Course by [Hitesh Choudhary Sir](https://hitesh.ai/)
