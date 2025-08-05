
3
REQUERIMIENTOS FUNCIONALES 
HU01 – Registro de usuario 
• Como usuario nuevo 
• Quiero registrarme en el sistema 
• Para acceder a las funcionalidades de la plataforma 
Criterios de Aceptación: 
• Formulario con campos obligatorios: nombre completo, email, 
• contraseña, pregunta de seguridad y un rol . 
• Sistema debe hashear contraseña y respuesta antes de guardar en 
• base de datos 
• Botón "Registrarse" debe estar deshabilitado hasta completar todos 
• los campos 
• Redirección automática a página de login después de registro 
• Exitoso 
 
HU02 – Inicio de sesión 
• Como usuario registrado 
• Quiero ingresar al sistema con mis credenciales 
• Para acceder a mi cuenta 
Criterios de Aceptación: 
• Campos de login: email y contraseña 
• Validar credenciales contra base de datos con contraseña hasheada 
• Mostrar mensaje "Credenciales incorrectas" si login falla 
• Recuperación de la contraseña mediante pregunta de seguridad. 
• Al  responder  correctamente  pregunta  de  seguridad,  permitir  crear  nueva 
contraseña 
• Redireccionar a dashboard principal después de login exitoso 
 
 
 
 
 
 
HU03 – Agendar cita 
• Como usuario 
• Quiero agendar citas 
• Para programar atención veterinaria 
Criterios de Aceptación: 
• Calendario visual que muestre horarios disponibles en verde y ocupados en 
gris 
• Formulario  con  campos:  fecha,  hora,  mascota,  doctor  (desplegable)  entre 
otros datos 
• Guardar cita en base de datos con estado "Programada" 
• Una vez creada la cita redirigir a la vista donde el cliente puede ver todas sus 
citas agendadas 
HU04 – Editar cita 
• Como usuario 
• Quiero modificar mis citas programadas 
• Para actualizar la información o cambiar horarios 
Criterios de Aceptación: 
• Solo permitir editar citas con estado "Programada" 
• Prellenar formulario con datos actuales de la cita 
• Mostrar mensaje de confirmación: "¿Confirmar cambios en la cita?" 
• Actualizar registro en base de datos 
HU05 – Eliminar cita 
• Como usuario 
• Quiero cancelar mis citas 
• Para liberar horarios que no utilizaré 
Criterios de Aceptación: 
• Modal de confirmación antes de 
• Liberar horario para que aparezca disponible nuevamente 
• Eliminar el registro del dashboard cliente y de la base de datos 
 
 
 
 
HU06 – Ver citas (Cliente) 
• Como cliente 
• Quiero visualizar mis citas programadas 
• Para organizar mi agenda y poder asistir a mis citas 
Criterios de Aceptación: 
• Dashboard con vista mostrando todas las citas que tiene pendiente 
• Cada cita muestra información importante sobre la misma 
• Botón para confirmar las citas pendientes 
 
HU07 – Chat en tiempo real 
• Como usuario 
• Quiero comunicarme con el veterinario 
• Para realizar consultas o recibir información 
Criterios de Aceptación: 
• Mostar el nombre del usuario con el que mantiene la conversación 
• Indicadores de estado de la conversación por tonalidad de color. 
• Campo de texto con botón "Enviar" y soporte para Enter 
• Notificación sonora y visual al recibir mensaje nuevo 
• Scroll automático al mensaje más reciente 
• Máximo 500 caracteres por mensaje 
 
HU08 – Ver citas (Veterinario) 
• Como veterinario 
• Quiero visualizar mis citas programadas 
• Para organizar mi agenda de citas programadas en el trabajo 
Criterios de Aceptación: 
• Dashboard con vista mostrando todas las citas que tiene pendiente 
• Cada cita muestra información importante sobre la misma 
• Boton para confirmar las citas pendientes 