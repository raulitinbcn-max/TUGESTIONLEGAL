-- Insertar tipos de trámite reales
INSERT INTO tramites_configuracion (id, tipoTramite, nombre, descripcion, activo, createdAt, updatedAt)
VALUES
  ('tramite_arraigo', 'Arraigo', 'Arraigo Sociolaboral', 'Trámite de arraigo por circunstancias excepcionales', 1, datetime('now'), datetime('now')),
  ('tramite_nacionalidad', 'Nacionalidad', 'Nacionalidad por residencia', 'Tramitación de la nacionalidad española por residencia', 1, datetime('now'), datetime('now')),
  ('tramite_cambio_nombre', 'Cambio_de_nombre', 'Cambio de nombre', 'Procedimiento para cambiar datos de identidad', 1, datetime('now'), datetime('now'));
