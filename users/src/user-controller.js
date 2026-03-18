/**
 * Este archivo es responsable de manejar las solicitudes HTTP relacionadas con los usuarios. 
 * Define los endpoints para iniciar sesión, crear un nuevo usuario y obtener información de un usuario específico.
 * El controlador recibe una instancia de UserService a través de su constructor, lo que le permite delegar la lógica de negocio a ese servicio.
 */

const UserError = require('./errors/UserError');

class UserController {
 
    /**
     * @param {UserService} userService - Servicio inyectado desde el entry point
     * Necesario para que el controlador pueda delegar en los métodos definidos en service, que a su vez llaman a las funciones de la base de datos.
     */
    constructor(userService) {
        this.userService = userService;

        // Bind necesario para que 'this' funcione correctamente cuando Express llama a estos métodos como callbacks de ruta
        // Sin el bind, 'this' dentro de los métodos no se referiría a la instancia de UserController
        // Esto causaría errores al intentar acceder a this.userService.
        this.loginUser = this.loginUser.bind(this);
        this.createUser = this.createUser.bind(this);
        this.getUser = this.getUser.bind(this);
        this.initmatch = this.initmatch.bind(this);
        this.endmatch = this.endmatch.bind(this);
        this.diffstats = this.diffstats.bind(this);
    }

    /**
     * POST /loginuser
     * Body esperado: { username: string, password: string }
     * 
     * Metodo para manejar la lógica de inicio de sesión de un usuario.
     * Recibe el nombre de usuario y la contraseña, y devuelve un mensaje de bienvenida si las credenciales son correctas.
     * Si las credenciales son incorrectas, se lanza un error que es manejado por el controlador para devolver una respuesta adecuada al cliente.
     * Req y res son los objetos de solicitud (request) y respuesta de Express, que permiten manejar la comunicación HTTP.
     * Express esta definido en users-service.js,  pero se usa aqui para manejar las solicitudes HTTP que llegan a los endpoints definidos en users.js.
     */
    async loginUser(req, res) {
        try {
            //Si username o password son undefined, se lanza un error
            const username = req.body && req.body.username;
            const password = req.body && req.body.password;
            const message = await this.userService.loginUser(username, password);
            //Error 200 OK se devuelve cuando la solicitud se ha procesado correctamente y se ha generado una respuesta exitosa. En este caso, se devuelve un mensaje de bienvenida personalizado al usuario que ha iniciado sesión correctamente.
            return res.status(200).json({ message });

        } catch (error) {
            if (error instanceof UserError) {
                // Si el error es una instancia de UserError, se devuelve una respuesta con el código de estado y el mensaje de error específicos definidos en esa clase.
                return res.status(error.statusCode).json({ error: error.message });
            }
            if (!username || !password) {
                //Error 400 Bad Request se devuelve cuando el cliente envía una solicitud que el servidor no puede procesar debido a una sintaxis incorrecta o datos faltantes.
                return res.status(400).json({ error: 'username y password son obligatorios' });
            }
            //Error 500 Internal Server Error se devuelve cuando ocurre un error inesperado en el servidor que impide procesar la solicitud.
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    /**
     * POST /createuser
     * Body esperado: { username: string, password: string }
     * 
     * Metodo para manejar la lógica de creación de un nuevo usuario.
     * Recibe el nombre de usuario y la contraseña, y devuelve un mensaje de bienvenida si la creación es exitosa.
     * Si el usuario ya existe o si la contraseña no cumple con los requisitos, se lanzan errores que son manejados por el controlador para devolver respuestas adecuadas al cliente.
     * Req y res son los objetos de solicitud (request) y respuesta de Express, que permiten manejar la comunicación HTTP.
     * Express esta definido en users-service.js,  pero se usa aqui para manejar las solicitudes HTTP que llegan a los endpoints definidos en users.js.
     */
    async createUser(req, res) {
        let username, password;
        try {
            // Si username o password no están definidos (undifined) da error
            username = req.body && req.body.username;
            password = req.body && req.body.password;

            const message = await this.userService.createUser(username, password);
            //Error 201 Created se devuelve cuando la solicitud ha sido procesada exitosamente y se ha creado un nuevo recurso (en este caso, un nuevo usuario). El mensaje de bienvenida personalizado se incluye en la respuesta para indicar que la creación del usuario fue exitosa.
            return res.status(201).json({ message });

        } catch (error) {
            if (error instanceof UserError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            if (!username || !password) {
                return res.status(400).json({ error: 'username y password son obligatorios' });
            }
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    /**
     * GET /users/:id
     * Params esperados: id (username del usuario)
     * 
     * Metodo para manejar la lógica de obtención de información de un usuario específico.
     * Recibe el nombre de usuario como parámetro en la URL, y devuelve la información del usuario si existe.
     * Si el usuario no existe, se lanza un error que es manejado por el controlador para devolver una respuesta adecuada al cliente.
     * Req y res son los objetos de solicitud (request) y respuesta de Express, que permiten manejar la comunicación HTTP.
     * Express esta definido en users-service.js,  pero se usa aqui para manejar las solicitudes HTTP que llegan a los endpoints definidos en users.js.
     */
    async getUser(req, res) {
        try {
            const { id: username } = req.params;
            const user = await this.userService.getUser(username);
            //Error 200 OK se devuelve cuando la solicitud se ha procesado correctamente y se ha generado una respuesta exitosa. En este caso, se devuelve la información del usuario solicitado.
            return res.status(200).json(user);

        } catch (error) {
            if (error instanceof UserError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

   /**
    * POST /initmatch
    * Body esperado: { username: string, strategy: string, difficulty: string }
    * 
    * Metodo para manejar la lógica de inicio de una nueva partida.
    * Recibe el nombre de usuario, la estrategia y la dificultad como parámetros en el cuerpo de la solicitud, y devuelve un mensaje indicando que la partida ha comenzado si los parámetros son válidos.
    * Si el usuario no existe o si los parámetros no son válidos, se lanzan errores que son manejados por el controlador para devolver respuestas adecuadas al cliente.
    * Req y res son los objetos de solicitud (request) y respuesta de Express, que permiten manejar la comunicación HTTP.
    * Express esta definido en users-service.js,  pero se usa aqui para manejar las solicitudes HTTP que llegan a los endpoints definidos en users.js.
    */
    async initmatch(req, res) {    
        try {
            const username = req.body && req.body.username;
            const strategy = req.body && req.body.strategy;
            const difficulty = req.body && req.body.difficulty;
            const message = await this.userService.initmatch(username, strategy, difficulty);
            //Error 200 OK se devuelve cuando la solicitud se ha procesado correctamente y se ha generado una respuesta exitosa. En este caso, se devuelve un mensaje indicando que la partida ha comenzado para el usuario especificado.
            return res.status(200).json({ message });
        } catch (error) {
            if (error instanceof UserError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            if (!username || !strategy || !difficulty) {
                return res.status(400).json({ error: 'username, strategy y difficulty son obligatorios' });
            }   
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    /**
    * POST /endmatch
    * Body esperado: { username: string, strategy: string, difficulty: string }
    * 
    * Metodo para manejar la lógica de inicio de terminar partida.
    * Recibe el nombre de usuario, la estrategia y la dificultad como parámetros en el cuerpo de la solicitud, y devuelve un mensaje indicando que la partida ha terminado si los parámetros son válidos.
    * Si el usuario no existe o si los parámetros no son válidos, se lanzan errores que son manejados por el controlador para devolver respuestas adecuadas al cliente.
    * Req y res son los objetos de solicitud (request) y respuesta de Express, que permiten manejar la comunicación HTTP.
    * Express esta definido en users-service.js,  pero se usa aqui para manejar las solicitudes HTTP que llegan a los endpoints definidos en users.js.
    */
    async endmatch(req, res) {    
        try {
            const username = req.body && req.body.username;
            const strategy = req.body && req.body.strategy;
            const difficulty = req.body && req.body.difficulty;
            const message = await this.userService.endmatch(username, strategy, difficulty);
            //Error 200 OK se devuelve cuando la solicitud se ha procesado correctamente y se ha generado una respuesta exitosa. En este caso, se devuelve un mensaje indicando que la partida ha terminado para el usuario especificado.
            return res.status(200).json({ message });
        } catch (error) {
            if (error instanceof UserError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            if (!username || !strategy || !difficulty) {
                return res.status(400).json({ error: 'username, strategy y difficulty son obligatorios' });
            }   
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    async diffstats(req, res) {
         if (!req.body) {
        return res.status(400).json({ error: 'Falta body en la petición' });
    }
        let username;
        try {
            username = req.body && req.body.username;
            const stats = await this.userService.diffstats(username);

            // Asegurarse de que stats sea siempre un array de objetos válidos
            const safeStats = stats.map(s => ({
                dificultad: s.dificultad || '',
                jugadas: s.jugadas ?? 0,
                perdidas: s.perdidas ?? 0,
                ganadas: s.ganadas ?? 0,
                porcentaje: s.porcentaje || '0.00 %'
            }))

            return res.status(200).json({stats : safeStats});
        } catch (error) {
            if (error instanceof UserError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            if (!username) {
                return res.status(400).json({ error: 'username es obligatorio' });
            }
            console.error(error); // Para ver qué está fallando
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
}

module.exports = UserController;