Para poder iniciar el proyecto
- Se necesita instalar npm install dotenv jsonwebtoken bcryptjs mysql2 en la carpeta backend.
- Se necesita instalar npm install en la carpeta principal foodManager.

- Importar base de datos a motor de su preferencia (xampp, heidisql, etc) 

- Para correr servidor necesitas entrar a "cd backend" luego iniciar el backend con node index.js.
- Para correr front-end necesitas iniciarlo mediante ionic serve.

## Cambios realizados
- Se creó el servidor mediante Express en la carpeta: backend.

- En la misma carpeta Backend se configuró la conexión con el login.

- Se definieron los observables para el login y registro de usuarios en backend/services.

- Se establecieron las autenticaciones con JWT en la carpeta app/routes.

- Se actualizó el apartado de bodegas para que se mostraran los cambios en este campo y se reflejaran en la base de datos.


## Base de datos

- Se creó la base de datos utilizando MySQL

- Se utilizó mariadb para correr el servidor de base de datos.


- Modelo:
<img width="4860" height="3164" alt="Image" src="https://github.com/user-attachments/assets/08b6fc08-94b4-469f-a0b0-f4b729749359" />


## Pruebas en PostMan:
<img width="920" height="510" alt="Image" src="https://github.com/user-attachments/assets/18706aac-13d8-440f-b705-90d187a51eca" />

<img width="671" height="400" alt="Image" src="https://github.com/user-attachments/assets/737623b5-0f0d-4fe3-9f8f-ceeb2ae0119c" />
