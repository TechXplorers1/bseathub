# Eathub Common Service (Spring Boot Backend)

This is the Spring Boot implementation of the Eathub backend, migrated from Firebase. It uses PostgreSQL as the primary database.

## Architecture
- **Framework:** Spring Boot 3.4.1
- **Database:** PostgreSQL
- **Security:** Spring Security (Permit-all for /api/v1 for development)
- **Entities:** Mapped according to the provided ER Diagram.

## Getting Started

### Prerequisites
1. **Java 17 or 21**
2. **Maven 3.x**
3. **PostgreSQL** (Ensure a database named `eathub_db` exists)

### Configuration
Update `src/main/resources/application.yml` with your local PostgreSQL credentials:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/eathub_db
    username: your_username
    password: your_password
```

### Running the Application
```bash
mvn spring-boot:run
```

### API Documentation
Once running, you can access the Swagger UI at:
- `http://localhost:8080/swagger-ui/index.html`

## Modules Implemented
- **User & Security:** User, Role, UserRole, Admin
- **Restaurant:** Restaurant, Address, Legal Profile, MenuCategory, MenuItem
- **Home Food:** HomeFoodProvider
- **Orders:** Order, OrderItem
- **Reviews:** Review
- **Chefs:** Chef, Services

## Next Steps
1. Implement **Spring Security JWT** for token-based authentication.
2. Complete the **Home Food** and **Chef** sub-entities.
3. Integrate **Spring AI** to replace GenKit functionality in the backend.
4. Refactor Next.js `bseathub` to fetch from this API.
