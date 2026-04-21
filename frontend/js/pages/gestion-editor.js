// Panel principal del editor
document.addEventListener('DOMContentLoaded', () => {
    const sidebarLinks = document.querySelectorAll('.gestionEditorMenuOption');
    const mobileMenuLabel = document.getElementById('gestionEditorMobileMenuLabel');
    const contentPanel = document.getElementById('gestionEditorContentPanel');

    if (!sidebarLinks.length) {
        return;
    }



    const sectionTemplates = {
        'crear-evento': {
            title: 'Crear Evento',
            html: `
                <nav class="breadcrumbEventos" aria-label="breadcrumb">
                        <ol class="breadcrumb">
                            <li class="breadcrumb-item"><a class="text-decoration-none"
                                    href="../modulo-editor.html">Inicio</a>
                            </li>
                            <li class="breadcrumb-item"><a class="text-decoration-none" href="#">Eventos</a></li>
                            <li class="breadcrumb-item active" aria-current="page">Crear Eventos
                            </li>
                        </ol>
                    </nav>
                <div class="ceContainer">
                <!-- Tarjeta del formulario -->
                    <div class="ceCard">
                    <p class="ceCardTitle">Evento Nuevo</p>
                        <!-- Indicador de pasos -->
                        <div class="ceStepper" aria-label="Pasos del formulario">
                        <button type="button" class="ceStep ceStepActive" id="stepIndicator1" aria-current="step"
                            aria-label="Ir al paso 1">
                            <span class="ceStepCircle text-white">1</span>
                            <span class="ceStepDot ceStepDotActive" id="stepDot1" aria-hidden="true"></span>
                        </button>
                        <div class="ceStepLine"></div>
                        <button type="button" class="ceStep" id="stepIndicator2" aria-label="Ir al paso 2">
                            <span class="ceStepCircle text-white">2</span>
                            <span class="ceStepDot" id="stepDot2" aria-hidden="true"></span>
                        </button>
                        </div>
                        <p class="ceStepLabel" id="stepLabel">Información del evento</p>

                        <!-- PASO 1-->
                        <div id="paso1">

                        <!-- Fecha de publicación -->
                        <div class="ceFormRow">
                            <label class="ceLabel" for="fechaPubAnio">*Fecha del Publicación del Evento</label>
                            <div class="ceFieldGroup">
                            <span class="ceFieldPrefix">Año</span>
                            <select class="ceSelect" id="fechaPubAnio" aria-label="Año de publicación"></select>
                            <span class="ceFieldPrefix">Mes</span>
                            <select class="ceSelect ceSelectSm" id="fechaPubMes" aria-label="Mes de publicación"></select>
                            <span class="ceFieldPrefix">Dia</span>
                            <select class="ceSelect ceSelectSm" id="fechaPubDia" aria-label="Día de publicación"></select>
                            </div>
                        </div>

                        <!-- Nombre del evento -->
                        <div class="ceFormRow">
                            <label class="ceLabel" for="nombreEvento">*Nombre del Evento</label>
                            <div class="ceFieldGroup">
                            <input type="text" class="ceInput" id="nombreEvento" placeholder="introduzca el dato solicitado"
                                aria-required="true">
                            </div>
                        </div>

                        <!-- Fecha del evento con + / - -->
                        <div class="ceFormRow">
                            <label class="ceLabel">*Fecha del Evento</label>
                            <div id="fechasEventoWrapper">
                            <div class="ceFieldGroup ceFechaRow" data-fecha-idx="0">
                                <span class="ceFieldPrefix">Año</span>
                                <select class="ceSelect" aria-label="Año del evento"></select>
                                <span class="ceFieldPrefix">Mes</span>
                                <select class="ceSelect ceSelectSm" aria-label="Mes del evento"></select>
                                <span class="ceFieldPrefix">Dia</span>
                                <select class="ceSelect ceSelectSm" aria-label="Día del evento"></select>
                                <button type="button" class="ceCircleBtn ceCircleBtnAdd" aria-label="Agregar fecha">
                                <i class="fa-solid fa-plus" aria-hidden="true"></i>
                                </button>
                                <button type="button" class="ceCircleBtn ceCircleBtnRemove" aria-label="Quitar fecha" disabled>
                                <i class="fa-solid fa-minus" aria-hidden="true"></i>
                                </button>
                            </div>
                            </div>
                        </div>

                        <!-- Horario -->
                        <div class="ceFormRow">
                            <label class="ceLabel">*Horario del Evento</label>
                            <div class="ceFieldGroup">
                            <span class="ceFieldPrefix">Hora de Inicio</span>
                            <select class="ceSelect" id="horaInicio" aria-label="Hora de inicio"></select>
                            <span class="ceFieldPrefix ms-3">Hora de Finalización</span>
                            <select class="ceSelect" id="horaFin" aria-label="Hora de finalización"></select>
                            </div>
                        </div>

                        <!-- Lugar del evento -->
                        <div class="ceFormRow">
                            <label class="ceLabel" for="lugarEvento">*Lugar del Evento</label>
                            <div class="ceFieldGroup">
                            <div class="ceLinkInput">
                                <i class="fa-solid fa-link ceLinkIcon" aria-hidden="true"></i>
                                <input type="url" class="ceInput ceLinkField" id="lugarEvento" placeholder="Adjuntar link"
                                aria-required="true">
                            </div>
                            </div>
                        </div>

                        <!-- Link Google Calendar -->
                        <div class="ceFormRow">
                            <label class="ceLabel" for="linkCalendar">*Link Google Calendar</label>
                            <div class="ceFieldGroup">
                            <div class="ceLinkInput">
                                <i class="fa-solid fa-link ceLinkIcon" aria-hidden="true"></i>
                                <input type="url" class="ceInput ceLinkField" id="linkCalendar" placeholder="Adjuntar link"
                                aria-required="true">
                            </div>
                            </div>
                        </div>

                        <!-- Descripción del evento -->
                        <div class="ceFormRow ceFormRowTop">
                            <label class="ceLabel" for="descripcionEvento">*Descripción del evento</label>
                            <div class="ceFieldGroup">
                            <textarea class="ceTextarea" id="descripcionEvento" rows="4" placeholder="introduzca el dato solicitado"
                                aria-required="true"></textarea>
                            </div>
                        </div>

                        <!-- Objetivos del evento -->
                        <div class="ceFormRow ceFormRowTop">
                            <label class="ceLabel">*Objetivos del evento</label>
                            <div class="ceFieldGroup ceFieldFull">
                            <div class="ceRichToolbar">
                                <button type="button" class="ceRichBtn" aria-label="Deshacer"><i class="fa-solid fa-rotate-left"
                                    aria-hidden="true"></i></button>
                                <button type="button" class="ceRichBtn" aria-label="Rehacer"><i class="fa-solid fa-rotate-right"
                                    aria-hidden="true"></i></button>
                                <span class="ceRichSep"></span>
                                <select class="ceRichFont" aria-label="Fuente">
                                <option>Sans Serif</option>
                                <option>Serif</option>
                                <option>Monospace</option>
                                </select>
                                <span class="ceRichSep"></span>
                                <select class="ceRichSize" aria-label="Tamaño">
                                <option>¶T</option>
                                <option>H1</option>
                                <option>H2</option>
                                <option>H3</option>
                                </select>
                                <span class="ceRichSep"></span>
                                <button type="button" class="ceRichBtn" aria-label="Negrita"><strong>B</strong></button>
                                <button type="button" class="ceRichBtn" aria-label="Cursiva"><em>I</em></button>
                                <button type="button" class="ceRichBtn" aria-label="Subrayado"><u>U</u></button>
                                <button type="button" class="ceRichBtn" aria-label="Color de texto"><span
                                    style="border-bottom:3px solid #333;font-size:.75rem;font-weight:700;"
                                    aria-hidden="true">A</span></button>
                                <span class="ceRichSep"></span>
                                <button type="button" class="ceRichBtn" aria-label="Alinear texto"><i class="fa-solid fa-align-left"
                                    aria-hidden="true"></i></button>
                                <button type="button" class="ceRichBtn" aria-label="Lista numerada"><i class="fa-solid fa-list-ol"
                                    aria-hidden="true"></i></button>
                                <button type="button" class="ceRichBtn" aria-label="Lista con viñetas"><i class="fa-solid fa-list-ul"
                                    aria-hidden="true"></i></button>
                                <button type="button" class="ceRichBtn" aria-label="Aumentar sangría"><i class="fa-solid fa-indent"
                                    aria-hidden="true"></i></button>
                                <button type="button" class="ceRichBtn" aria-label="Reducir sangría"><i class="fa-solid fa-outdent"
                                    aria-hidden="true"></i></button>
                            </div>
                            <div class="ceRichEditor" contenteditable="true" id="objetivosEditor" role="textbox" aria-multiline="true"
                                aria-label="Editor de objetivos" aria-required="true"></div>
                            </div>
                        </div>

                        <!-- Agenda / Programa -->
                        <div class="ceFormRow ceFormRowTop">
                            <label class="ceLabel">*Agenda/ Programa del evento</label>
                            <div class="ceFieldGroup ceFieldFull">
                            <div class="ceRichToolbar">
                                <button type="button" class="ceRichBtn" aria-label="Deshacer"><i class="fa-solid fa-rotate-left"
                                    aria-hidden="true"></i></button>
                                <button type="button" class="ceRichBtn" aria-label="Rehacer"><i class="fa-solid fa-rotate-right"
                                    aria-hidden="true"></i></button>
                                <span class="ceRichSep"></span>
                                <select class="ceRichFont" aria-label="Fuente">
                                <option>Sans Serif</option>
                                <option>Serif</option>
                                </select>
                                <span class="ceRichSep"></span>
                                <select class="ceRichSize" aria-label="Tamaño">
                                <option>¶T</option>
                                <option>H1</option>
                                <option>H2</option>
                                </select>
                                <span class="ceRichSep"></span>
                                <button type="button" class="ceRichBtn" aria-label="Negrita"><strong>B</strong></button>
                                <button type="button" class="ceRichBtn" aria-label="Cursiva"><em>I</em></button>
                                <button type="button" class="ceRichBtn" aria-label="Subrayado"><u>U</u></button>
                                <button type="button" class="ceRichBtn" aria-label="Color de texto"><span
                                    style="border-bottom:3px solid #333;font-size:.75rem;font-weight:700;"
                                    aria-hidden="true">A</span></button>
                                <span class="ceRichSep"></span>
                                <button type="button" class="ceRichBtn" aria-label="Alinear texto"><i class="fa-solid fa-align-left"
                                    aria-hidden="true"></i></button>
                                <button type="button" class="ceRichBtn" aria-label="Lista numerada"><i class="fa-solid fa-list-ol"
                                    aria-hidden="true"></i></button>
                                <button type="button" class="ceRichBtn" aria-label="Lista con viñetas"><i class="fa-solid fa-list-ul"
                                    aria-hidden="true"></i></button>
                                <button type="button" class="ceRichBtn" aria-label="Aumentar sangría"><i class="fa-solid fa-indent"
                                    aria-hidden="true"></i></button>
                                <button type="button" class="ceRichBtn" aria-label="Reducir sangría"><i class="fa-solid fa-outdent"
                                    aria-hidden="true"></i></button>
                            </div>
                            <div class="ceRichEditor" contenteditable="true" id="agendaEditor" role="textbox" aria-multiline="true"
                                aria-label="Editor de agenda" aria-required="true"></div>
                            </div>
                        </div>

                        <!-- Agenda Lectura Fácil -->
                        <div class="ceFormRow ceFormRowTop">
                            <label class="ceLabel">*Agenda del evento de Lectura Fácil</label>
                            <div class="ceFieldGroup ceFieldFull">
                            <div class="ceRichToolbar">
                                <button type="button" class="ceRichBtn" aria-label="Deshacer"><i class="fa-solid fa-rotate-left"
                                    aria-hidden="true"></i></button>
                                <button type="button" class="ceRichBtn" aria-label="Rehacer"><i class="fa-solid fa-rotate-right"
                                    aria-hidden="true"></i></button>
                                <span class="ceRichSep"></span>
                                <select class="ceRichFont" aria-label="Fuente">
                                <option>Sans Serif</option>
                                <option>Serif</option>
                                </select>
                                <span class="ceRichSep"></span>
                                <select class="ceRichSize" aria-label="Tamaño">
                                <option>¶T</option>
                                <option>H1</option>
                                <option>H2</option>
                                </select>
                                <span class="ceRichSep"></span>
                                <button type="button" class="ceRichBtn" aria-label="Negrita"><strong>B</strong></button>
                                <button type="button" class="ceRichBtn" aria-label="Cursiva"><em>I</em></button>
                                <button type="button" class="ceRichBtn" aria-label="Subrayado"><u>U</u></button>
                                <button type="button" class="ceRichBtn" aria-label="Color de texto"><span
                                    style="border-bottom:3px solid #333;font-size:.75rem;font-weight:700;"
                                    aria-hidden="true">A</span></button>
                                <span class="ceRichSep"></span>
                                <button type="button" class="ceRichBtn" aria-label="Alinear texto"><i class="fa-solid fa-align-left"
                                    aria-hidden="true"></i></button>
                                <button type="button" class="ceRichBtn" aria-label="Lista numerada"><i class="fa-solid fa-list-ol"
                                    aria-hidden="true"></i></button>
                                <button type="button" class="ceRichBtn" aria-label="Lista con viñetas"><i class="fa-solid fa-list-ul"
                                    aria-hidden="true"></i></button>
                                <button type="button" class="ceRichBtn" aria-label="Aumentar sangría"><i class="fa-solid fa-indent"
                                    aria-hidden="true"></i></button>
                                <button type="button" class="ceRichBtn" aria-label="Reducir sangría"><i class="fa-solid fa-outdent"
                                    aria-hidden="true"></i></button>
                            </div>
                            <div class="ceRichEditor" contenteditable="true" id="agendaFacilEditor" role="textbox"
                                aria-multiline="true" aria-label="Editor agenda lectura fácil" aria-required="true"></div>
                            </div>
                        </div>

                        <!-- Botón Siguiente -->
                        <div class="ceActions ceActionsEnd mt-4">
                            <button type="button" class="ceBtn ceBtnPrimary" id="btnSiguiente">
                            Siguiente <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
                            </button>
                        </div>

                        </div>
                        <!-- FIN PASO 1 -->

                        <!--PASO 2  (oculto por defecto con d-none)-->
                        <div id="paso2" class="d-none">

                        <!-- Información de contacto -->
                        <div class="ceFormRow ceFormRowTop">
                            <label class="ceLabel">*Información de Contacto</label>
                            <div class="ceFieldGroup ceFieldFull ceContactGroup">
                            <div class="ceContactRow">
                                <label class="ceContactLabel" for="contactoNombre">*Nombre Completo</label>
                                <input type="text" class="ceInput" id="contactoNombre" placeholder="introduzca el dato solicitado"
                                aria-required="true">
                            </div>
                            <div class="ceContactRow mt-2">
                                <label class="ceContactLabel" for="contactoCorreo">*Correo Electrónico</label>
                                <input type="email" class="ceInput" id="contactoCorreo" placeholder="introduzca el dato solicitado"
                                aria-required="true">
                            </div>
                            </div>
                        </div>

                        <!-- Imágenes ilustrativas -->
                        <div class="ceFormRow ceFormRowTop">
                            <label class="ceLabel">*Imágenes Ilustrativas del evento</label>
                            <div class="ceFieldGroup ceFieldFull">
                            <div id="imagenesWrapper">
                                <div class="ceFileRow" data-file-idx="0">
                                <div class="ceFileInput">
                                    <i class="fa-solid fa-paperclip ceFileIcon" aria-hidden="true"></i>
                                    <span class="ceFileName">Adjuntar Documento</span>
                                    <input type="file" class="ceFileReal" accept="image/*" aria-label="Adjuntar imagen ilustrativa">
                                </div>
                                <button type="button" class="ceCircleBtn ceCircleBtnAdd" aria-label="Agregar imagen">
                                    <i class="fa-solid fa-plus" aria-hidden="true"></i>
                                </button>
                                <button type="button" class="ceCircleBtn ceCircleBtnRemove" aria-label="Quitar imagen" disabled>
                                    <i class="fa-solid fa-minus" aria-hidden="true"></i>
                                </button>
                                </div>
                            </div>
                            <p class="ceFileNote">máximo 10 MB por archivo</p>
                            <div class="ceContactRow mt-2">
                                <label class="ceContactLabel" for="descImagen">*Descripción de imagen</label>
                                <input type="text" class="ceInput" id="descImagen" placeholder="introduzca el dato solicitado"
                                aria-required="true">
                            </div>
                            </div>
                        </div>

                        <!-- Video -->
                        <div class="ceFormRow ceFormRowTop">
                            <label class="ceLabel">Video</label>
                            <div class="ceFieldGroup ceFieldFull">
                            <div id="videosWrapper">
                                <div class="ceFileRow" data-file-idx="0">
                                <div class="ceFileInput">
                                    <i class="fa-solid fa-paperclip ceFileIcon" aria-hidden="true"></i>
                                    <span class="ceFileName">Adjuntar Documento</span>
                                    <input type="file" class="ceFileReal" accept="video/*" aria-label="Adjuntar video">
                                </div>
                                <button type="button" class="ceCircleBtn ceCircleBtnAdd" aria-label="Agregar video">
                                    <i class="fa-solid fa-plus" aria-hidden="true"></i>
                                </button>
                                <button type="button" class="ceCircleBtn ceCircleBtnRemove" aria-label="Quitar video" disabled>
                                    <i class="fa-solid fa-minus" aria-hidden="true"></i>
                                </button>
                                </div>
                            </div>
                            <p class="ceFileNote">máximo 10 MB por archivo</p>
                            </div>
                        </div>

                        <!-- Público Meta -->
                        <div class="ceFormRow">
                            <label class="ceLabel" for="publicoMeta">*Público Meta</label>
                            <div class="ceFieldGroup">
                            <input type="text" class="ceInput" id="publicoMeta" placeholder="introduzca el dato solicitado"
                                aria-required="true">
                            </div>
                        </div>

                        <!-- Cupo del evento -->
                        <div class="ceFormRow">
                            <label class="ceLabel" for="cupoEvento">*Cupo del Evento</label>
                            <div class="ceFieldGroup">
                            <select class="ceSelect" id="cupoEvento" aria-required="true">
                                <option value="0000">0000</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                                <option value="200">200</option>
                                <option value="ilimitado">Ilimitado</option>
                            </select>
                            </div>
                        </div>

                        <!-- Información Adicional -->
                        <div class="ceFormRow ceFormRowTop">
                            <label class="ceLabel">*Información Adicional</label>
                            <div class="ceFieldGroup ceFieldFull">
                            <div class="ceRichToolbar">
                                <button type="button" class="ceRichBtn" aria-label="Deshacer"><i class="fa-solid fa-rotate-left"
                                    aria-hidden="true"></i></button>
                                <button type="button" class="ceRichBtn" aria-label="Rehacer"><i class="fa-solid fa-rotate-right"
                                    aria-hidden="true"></i></button>
                                <span class="ceRichSep"></span>
                                <select class="ceRichFont" aria-label="Fuente">
                                <option>Sans Serif</option>
                                <option>Serif</option>
                                </select>
                                <span class="ceRichSep"></span>
                                <select class="ceRichSize" aria-label="Tamaño">
                                <option>¶T</option>
                                <option>H1</option>
                                </select>
                                <span class="ceRichSep"></span>
                                <button type="button" class="ceRichBtn" aria-label="Negrita"><strong>B</strong></button>
                                <button type="button" class="ceRichBtn" aria-label="Cursiva"><em>I</em></button>
                                <button type="button" class="ceRichBtn" aria-label="Subrayado"><u>U</u></button>
                                <button type="button" class="ceRichBtn" aria-label="Color de texto"><span
                                    style="border-bottom:3px solid #333;font-size:.75rem;font-weight:700;"
                                    aria-hidden="true">A</span></button>
                                <span class="ceRichSep"></span>
                                <button type="button" class="ceRichBtn" aria-label="Alinear texto"><i class="fa-solid fa-align-left"
                                    aria-hidden="true"></i></button>
                                <button type="button" class="ceRichBtn" aria-label="Lista numerada"><i class="fa-solid fa-list-ol"
                                    aria-hidden="true"></i></button>
                                <button type="button" class="ceRichBtn" aria-label="Lista con viñetas"><i class="fa-solid fa-list-ul"
                                    aria-hidden="true"></i></button>
                                <button type="button" class="ceRichBtn" aria-label="Aumentar sangría"><i class="fa-solid fa-indent"
                                    aria-hidden="true"></i></button>
                                <button type="button" class="ceRichBtn" aria-label="Reducir sangría"><i class="fa-solid fa-outdent"
                                    aria-hidden="true"></i></button>
                            </div>
                            <div class="ceRichEditor" contenteditable="true" id="infoAdicionalEditor" role="textbox"
                                aria-multiline="true" aria-label="Editor información adicional" aria-required="true"></div>
                            </div>
                        </div>

                        <!-- Referencias -->
                        <div class="ceFormRow ceFormRowTop">
                            <label class="ceLabel">Referencias de información brindada</label>
                            <div class="ceFieldGroup ceFieldFull">
                            <div id="referenciasWrapper">
                                <div class="ceRefRow" data-ref-idx="0">
                                <input type="text" class="ceInput" placeholder="introduzca el dato solicitado"
                                    aria-label="Referencia de información">
                                <button type="button" class="ceCircleBtn ceCircleBtnAdd" aria-label="Agregar referencia">
                                    <i class="fa-solid fa-plus" aria-hidden="true"></i>
                                </button>
                                <button type="button" class="ceCircleBtn ceCircleBtnRemove" aria-label="Quitar referencia" disabled>
                                    <i class="fa-solid fa-minus" aria-hidden="true"></i>
                                </button>
                                </div>
                                <div class="ceLinkInput mt-2" style="max-width:460px;">
                                <i class="fa-solid fa-link ceLinkIcon" aria-hidden="true"></i>
                                <input type="url" class="ceInput ceLinkField" placeholder="Adjuntar link de la referencia"
                                    aria-label="Link de la referencia">
                                </div>
                            </div>
                            </div>
                        </div>

                        <!-- Palabras clave -->
                        <div class="ceFormRow">
                            <label class="ceLabel" for="palabrasClave">*Palabras Claves</label>
                            <div class="ceFieldGroup">
                            <input type="text" class="ceInput" id="palabrasClave" placeholder="introduzca el dato solicitado"
                                aria-required="true">
                            </div>
                        </div>

                        <!-- Formulario para usuario interesado -->
                        <div class="ceFormRow ceFormRowTop">
                            <label class="ceLabel" for="tipoFormulario">*Formulario para usuario interesados</label>
                            <div class="ceFieldGroup ceFieldFull">
                            <select class="ceSelectFull" id="tipoFormulario" aria-required="true">
                                <option value="">seleccione el tipo de formulario</option>
                                <option value="inscripcion">Formulario de Inscripción</option>
                                <option value="confirmacion">Formulario de Confirmación</option>
                            </select>

                            <!-- Sub-panel Inscripción -->
                            <div id="subFormInscripcion" class="ceSubForm d-none" aria-live="polite">
                                <p class="ceSubFormTitle">Formulario de Inscripción:</p>
                                <p class="ceSubFormDesc">Seleccione los aspectos a contemplar en el formulario:</p>
                                <ul class="ceCheckList">
                                <li><label><input type="checkbox"> 1. Nombre Completo.</label></li>
                                <li><label><input type="checkbox"> 2. Cédula.</label></li>
                                <li><label><input type="checkbox"> 3. Profesión u Oficio.</label></li>
                                <li><label><input type="checkbox"> 4. Correo electrónico.</label></li>
                                <li><label><input type="checkbox"> 5. Número de teléfono.</label></li>
                                <li><label><input type="checkbox"> 6. Dirección física (provincia, cantón, distrito, otras
                                    señales).</label></li>
                                <li><label><input type="checkbox"> 7. Entidad para la que trabaja.</label></li>
                                <li><label><input type="checkbox"> 8. Adjuntar documentos requeridos por el editor.</label></li>
                                <li><label><input type="checkbox"> 9. Autorización para recibir notificaciones de este u otro
                                    evento.</label></li>
                                <li>
                                    <label><input type="checkbox"> 10. Condición médica.</label>
                                    <ul class="ceSubCheckList">
                                    <li><span>-Alergias a medicamentos.</span></li>
                                    <li><span>-Tipo Deficiencia: (pregunta Washington).</span></li>
                                    </ul>
                                </li>
                                <li><label><input type="checkbox"> 11. Pago de transporte y monto aproximado.</label></li>
                                <li><label><input type="checkbox"> 12. Hospedaje.</label></li>
                                <li><label><input type="checkbox"> 13. Alimentación</label></li>
                                </ul>
                            </div>

                            <!-- Sub-panel Confirmación -->
                            <div id="subFormConfirmacion" class="ceSubForm d-none" aria-live="polite">
                                <p class="ceSubFormTitle">Formulario de Confirmación:</p>
                                <p class="ceSubFormDesc">Seleccione los aspectos a contemplar en el formulario:</p>
                                <ul class="ceCheckList">
                                <li><label><input type="checkbox"> 1. Nombre Completo.</label></li>
                                <li><label><input type="checkbox"> 2. Correo electrónico.</label></li>
                                <li><label><input type="checkbox"> 3. Número de teléfono.</label></li>
                                <li><label><input type="checkbox"> 4. Entidad para la que trabaja.</label></li>
                                <li><label><input type="checkbox"> 5. Autorización para recibir notificaciones de este u otro
                                    evento.</label></li>
                                </ul>
                            </div>
                            </div>
                        </div>

                        <!-- Fijar como evento importante -->
                        <div class="ceFormRow">
                            <label class="ceLabel">*Fijar como evento importante</label>
                            <div class="ceFieldGroup ceRadioGroup">
                            <label class="ceRadioLabel">
                                <input type="radio" name="fijarImportante" value="si" checked> Sí
                            </label>
                            <label class="ceRadioLabel">
                                <input type="radio" name="fijarImportante" value="no"> No
                            </label>
                            </div>
                        </div>

                        <!-- Lista de difusión -->
                        <div class="ceFormRow">
                            <label class="ceLabel" for="listaDifusion">*Lista de difusión</label>
                            <div class="ceFieldGroup">
                            <select class="ceSelectFull" id="listaDifusion" aria-required="true">
                                <option value="">seleccione el/los datos necesarios</option>
                            </select>
                            </div>
                        </div>

                        <!-- Fecha final de visualización -->
                        <div class="ceFormRow">
                            <label class="ceLabel">*Fecha final de visualización del evento</label>
                            <div class="ceFieldGroup">
                            <span class="ceFieldPrefix">Año</span>
                            <select class="ceSelect" id="fechaFinAnio" aria-label="Año fecha final"></select>
                            <span class="ceFieldPrefix">Mes</span>
                            <select class="ceSelect ceSelectSm" id="fechaFinMes" aria-label="Mes fecha final"></select>
                            <span class="ceFieldPrefix">Dia</span>
                            <select class="ceSelect ceSelectSm" id="fechaFinDia" aria-label="Día fecha final"></select>
                            </div>
                        </div>

                        <!-- Redes sociales -->
                        <div class="ceFormRow ceFormRowTop">
                            <label class="ceLabel">*Redes Sociales</label>
                            <div class="ceFieldGroup ceRadioGroupCol">
                            <label class="ceRadioLabel">
                                <input type="checkbox" name="redes" value="facebook" checked> Facebook
                            </label>
                            <label class="ceRadioLabel">
                                <input type="checkbox" name="redes" value="twitter" checked> Twitter
                            </label>
                            <label class="ceRadioLabel">
                                <input type="checkbox" name="redes" value="linkedin" checked> LinkedIn
                            </label>
                            </div>
                        </div>

                        <!-- Botones paso 2 -->
                        <div class="ceActions mt-4">
                            <div class="ceActionIcons">
                            <button type="button" id="btnPreviewEvento" class="ceIconBtn" aria-label="Vista previa del evento">
                                <i class="fa-regular fa-eye" aria-hidden="true"></i>
                            </button>
                            <button type="button" class="ceIconBtn" aria-label="Guardar borrador">
                                <i class="fa-regular fa-floppy-disk" aria-hidden="true"></i>
                            </button>
                            </div>
                            <div class="ceActionBtns">
                            <button type="button" class="ceBtn ceBtnSecondary" id="btnAnterior">
                                <i class="fa-solid fa-chevron-left" aria-hidden="true"></i> Anterior
                            </button>
                            <button type="button" class="ceBtn ceBtnPrimary" id="btnEnviarAprobacion">
                                Enviar a aprobación <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
                            </button>
                            </div>
                        </div>
                        </div>
                        <!-- FIN PASO 2 -->
                    </div>
                    <!-- FIN ceCard -->
                </div>
            `,
        },
        'eventos-publicados': {
            title: 'Eventos Publicados',
            html: `
                <nav class="breadcrumbEventos" aria-label="breadcrumb">
                        <ol class="breadcrumb">
                            <li class="breadcrumb-item"><a class="text-decoration-none"
                                href="../modulo-admin.html">Inicio</a>
                            </li>
                            <li class="breadcrumb-item"><a class="text-decoration-none" href="#">Eventos</a></li>
                            <li class="breadcrumb-item active" aria-current="page">Eventos Publicados
                            </li>
                        </ol>
                    </nav>
                    <div class="container-fluid">
                            <div class="row mt-5">
                                <div
                                    class="col-12 d-flex justify-content-start align-items-center gap-2 gap-sm-3 mt-4 aprobacionEventosTitle">
                                    <div class="iconoAprobacionEventos">
                                        <i class="fa-solid fa-file-circle-check"></i>
                                    </div>
                                    <p class="txtAprobacionEventos mb-0">Eventos Publicados</p>
                                </div>
                                <div class="col-12 buscadorEventosTitle mt-4 mb-2">
                                    <p>Buscador de Eventos</p>
                                </div>
                                <div class="col-12 buscadorEventosSubtitle mb-2">
                                    Filtrar por:
                                </div>
                                <div class="col-12 mb-4">
                                    <div class="row g-2 align-items-center">
                                        <div class="col-12 col-sm-4 col-md-auto">
                                            <label class="visually-hidden" for="gestionEventosPublicadosEditorFiltro">Filtro de
                                                eventos</label>
                                            <select id="gestionEventosPublicadosEditorFiltro" class="form-select gestionEventosSelect"
                                                aria-label="Tipo de filtro">
                                                <option selected>Título del Evento</option>
                                                <option>Fecha del Evento</option>
                                                <option>Nombre del Editor</option>
                                            </select>
                                        </div>

                                        <div class="col-12 col-sm">
                                            <label class="visually-hidden" for="gestionEventosPublicadosEditorBusqueda">Dato a
                                                buscar</label>
                                            <input id="gestionEventosPublicadosEditorBusqueda" class="form-control gestionEventosInput"
                                                type="text" placeholder="Ingrese el dato indicado"
                                                aria-label="Ingrese el dato indicado">
                                        </div>

                                        <div class="col-12 col-sm-auto d-grid d-sm-inline-flex">
                                            <button id="gestionEventosPublicadosEditorBuscarBtn" class="btn gestionEventosSearchBtn" type="button" aria-label="Buscar">
                                                <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                                            </button>
                                        </div>
                                        <div class="col-12 col-sm-auto d-grid d-sm-inline-flex">
                                            <button id="eventosPublicadosEditorLimpiarFiltro" class="btn btn-outline-secondary" type="button" aria-label="Limpiar filtros">
                                                Limpiar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-12 mt-4 fw-bold d-flex justify-content-end">
                                    <p id="eventosPublicadosEditorConteo">Cargando...</p>
                                </div>
                            </div>
                        </div>

                        <div class="cardsEventosPublicados container-fluid mt-3" id="cardsEventosPublicadosEditor">

                        </div>  

                        <div class="modal fade" id="modalEditarEventoEditor" tabindex="-1">
                            <div class="modal-dialog modal-dialog-centered modalRechazoSuscriptorAncho">
                                <div class="modal-content modalRechazoSuscriptorContenido">
                                    <div class="modal-body modalRechazoSuscriptorBody">
                                        <p class="modalRechazoSuscriptorTitulo">Editar Evento</p>
                                        <p class="modalRechazoSuscriptorDescripcion">
                                            Modifique los datos necesarios del evento y luego guarde los cambios.
                                        </p>

                                        <div id="modalEditarEventoEditorFormHost" class="modalRechazoSuscriptorFormulario"></div>

                                        <div class="modalRechazoSuscriptorAcciones d-grid gap-3 d-md-flex justify-content-center my-4">
                                            <button type="button" class="btn modalRechazoSuscriptorBtnCancelar px-4" data-bs-dismiss="modal">Cancelar</button>
                                            <button type="button" class="btn modalRechazoSuscriptorBtnAceptar modalEditarEventoEditorBtnGuardar px-4">Guardar</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="modal fade" id="modalEventoEditadoEditor" tabindex="-1">
                            <div class="modal-dialog modal-dialog-centered modalSuscripcionEnviadaAncho">
                                <div class="modal-content modalSuscripcionEnviadaContenido">
                                    <div class="modal-body modalSuscripcionEnviadaBody">
                                        <div class="modalSuscripcionEnviadaIcono" aria-hidden="true">
                                            <i class="fa-solid fa-check"></i>
                                        </div>
                                        <p class="modalSuscripcionEnviadaTitulo">Evento Editado</p>
                                        <p class="modalSuscripcionEnviadaDescripcion">
                                            Se editó con éxito el evento seleccionado.
                                        </p>
                                        <button type="button" class="btn modalSuscripcionEnviadaBtnContinuar" data-bs-dismiss="modal">Continuar</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                
            `,
        },
        'eventos-borrador': {
            title: 'Eventos en Borrador',
            html: `
                <nav class="breadcrumbEventos" aria-label="breadcrumb">
                        <ol class="breadcrumb">
                            <li class="breadcrumb-item"><a class="text-decoration-none"
                                href="../modulo-admin.html">Inicio</a>
                            </li>
                            <li class="breadcrumb-item"><a class="text-decoration-none" href="#">Eventos</a></li>
                            <li class="breadcrumb-item active" aria-current="page">Eventos en Borrador
                            </li>
                        </ol>
                    </nav>
                    <div class="container-fluid">
                            <div class="row mt-5">
                                <div
                                    class="col-12 d-flex justify-content-start align-items-center gap-2 gap-sm-3 mt-4 aprobacionEventosTitle">
                                    <div class="iconoAprobacionEventos">
                                        <i class="fa-solid fa-file-circle-check"></i>
                                    </div>
                                    <p class="txtAprobacionEventos mb-0">Eventos en Borrador</p>
                                </div>
                                <div class="col-12 d-flex flex-column flex-lg-row justify-content-center align-items-center gap-2 gap-sm-3 mt-4 aprobacionEventosSubtitle">
                                    <button type="button" class="btn btnEventosBorrador btnEventosEnEdicion is-active" data-status="edicion">En edición</button>
                                    <button type="button" class="btn btnEventosBorrador btnEventosEnPendiente" data-status="pendiente">Pendientes de Aprobación</button>
                                    <button type="button" class="btn btnEventosBorrador btnEventosEnRechazado" data-status="rechazado">Rechazados</button>
                                </div>
                                <div class="col-12 buscadorEventosTitle mt-4 mb-2">
                                    <p>Buscador de Eventos</p>
                                </div>
                                <div class="col-12 buscadorEventosSubtitle mb-2">
                                    Filtrar por:
                                </div>
                                <div class="col-12 mb-4">
                                    <div class="row g-2 align-items-center">
                                        <div class="col-12 col-sm-4 col-md-auto">
                                            <label class="visually-hidden" for="gestionEventosFiltro">Filtro de
                                                eventos</label>
                                            <select id="gestionEventosFiltro" class="form-select gestionEventosSelect"
                                                aria-label="Tipo de filtro">
                                                <option selected>Título del Evento</option>
                                                <option>Fecha del Evento</option>
                                                <option>Nombre del Editor</option>
                                            </select>
                                        </div>

                                        <div class="col-12 col-sm">
                                            <label class="visually-hidden" for="gestionEventosBusqueda">Dato a
                                                buscar</label>
                                            <input id="gestionEventosBusqueda" class="form-control gestionEventosInput"
                                                type="text" placeholder="Ingrese el dato indicado"
                                                aria-label="Ingrese el dato indicado">
                                        </div>

                                        <div class="col-12 col-sm-auto d-grid d-sm-inline-flex">
                                            <button class="btn gestionEventosSearchBtn" type="button" aria-label="Buscar">
                                                <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-12 mt-4 fw-bold d-flex justify-content-end">
                                    <p>1-20 de 57</p>
                                </div>
                            </div>
                        </div>

                        <div class="cardsEventosBorrador  container-fluid mt-3" id="cardsEventosBorradorEditor">

                        </div>  

                        <div class="modal fade" id="modalRechazoEventoAnotaciones" tabindex="-1">
                            <div class="modal-dialog modal-dialog-centered modalRechazoListaDifusionAncho">
                                <div class="modal-content modalRechazoListaDifusionContenido">
                                    <div class="modal-body modalRechazoListaDifusionBody">
                                        <p class="modalRechazoListaDifusionTitulo">Rechazo de Evento</p>
                                        <p class="modalRechazoListaDifusionDescripcion">
                                            El Evento enviado ha sido rechazado, a continuación, presentamos el motivo en las
                                            anotaciones realizadas por el administrador responsable:
                                        </p>
                                        <div id="modalRechazoEventoMotivo" class="modalRechazoEventoAnotaciones"></div>
                                        <div class="modalRechazoListaDifusionAcciones d-grid gap-3 d-md-flex justify-content-center my-4">
                                            <button type="button" class="btn modalRechazoListaDifusionBtnCancelar px-4"
                                                data-bs-dismiss="modal">Cancelar</button>
                                            <button type="button" class="btn modalRechazoListaDifusionBtnAceptar px-4"
                                                data-bs-dismiss="modal">Aceptar</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="modal fade" id="modalEditarEventoEditor" tabindex="-1">
                            <div class="modal-dialog modal-dialog-centered modalRechazoSuscriptorAncho">
                                <div class="modal-content modalRechazoSuscriptorContenido">
                                    <div class="modal-body modalRechazoSuscriptorBody">
                                        <p class="modalRechazoSuscriptorTitulo">Editar Evento</p>
                                        <p class="modalRechazoSuscriptorDescripcion">
                                            Modifique los datos necesarios del evento y luego guarde los cambios.
                                        </p>

                                        <div id="modalEditarEventoEditorFormHost" class="modalRechazoSuscriptorFormulario"></div>

                                        <div class="modalRechazoSuscriptorAcciones d-grid gap-3 d-md-flex justify-content-center my-4">
                                            <button type="button" class="btn modalRechazoSuscriptorBtnCancelar px-4" data-bs-dismiss="modal">Cancelar</button>
                                            <button type="button" class="btn modalRechazoSuscriptorBtnAceptar modalEditarEventoEditorBtnGuardar px-4">Guardar</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="modal fade" id="modalEventoEditadoEditor" tabindex="-1">
                            <div class="modal-dialog modal-dialog-centered modalSuscripcionEnviadaAncho">
                                <div class="modal-content modalSuscripcionEnviadaContenido">
                                    <div class="modal-body modalSuscripcionEnviadaBody">
                                        <div class="modalSuscripcionEnviadaIcono" aria-hidden="true">
                                            <i class="fa-solid fa-check"></i>
                                        </div>
                                        <p class="modalSuscripcionEnviadaTitulo">Evento Editado</p>
                                        <p class="modalSuscripcionEnviadaDescripcion">
                                            Se editó con éxito el evento seleccionado.
                                        </p>
                                        <button type="button" class="btn modalSuscripcionEnviadaBtnContinuar" data-bs-dismiss="modal">Continuar</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
            
            `,
        },
        'eventos-finalizados': {
            title: 'Eventos Finalizados',
            html: `
                <nav class="breadcrumbEventos" aria-label="breadcrumb">
                        <ol class="breadcrumb">
                            <li class="breadcrumb-item"><a class="text-decoration-none"
                                href="../modulo-admin.html">Inicio</a>
                            </li>
                            <li class="breadcrumb-item"><a class="text-decoration-none" href="#">Eventos</a></li>
                            <li class="breadcrumb-item active" aria-current="page">Eventos Finalizados
                            </li>
                        </ol>
                    </nav>
                    <div class="container-fluid">
                            <div class="row mt-5">
                                <div
                                    class="col-12 d-flex justify-content-start align-items-center gap-2 gap-sm-3 mt-4 aprobacionEventosTitle">
                                    <div class="iconoAprobacionEventos">
                                        <i class="fa-solid fa-file-circle-check"></i>
                                    </div>
                                    <p class="txtAprobacionEventos mb-0">Eventos Finalizados</p>
                                </div>
                                <div class="col-12 buscadorEventosTitle mt-4 mb-2">
                                    <p>Buscador de Eventos</p>
                                </div>
                                <div class="col-12 buscadorEventosSubtitle mb-2">
                                    Filtrar por:
                                </div>
                                <div class="col-12 mb-4">
                                    <div class="row g-2 align-items-center">
                                        <div class="col-12 col-sm-4 col-md-auto">
                                            <label class="visually-hidden" for="gestionEventosFinalizadosFiltro">Filtro de
                                                eventos</label>
                                            <select id="gestionEventosFinalizadosFiltro" class="form-select gestionEventosSelect"
                                                aria-label="Tipo de filtro">
                                                <option selected>Título del Evento</option>
                                                <option>Fecha del Evento</option>
                                                <option>Nombre del Editor</option>
                                            </select>
                                        </div>

                                        <div class="col-12 col-sm">
                                            <label class="visually-hidden" for="gestionEventosFinalizadosBusqueda">Dato a
                                                buscar</label>
                                            <input id="gestionEventosFinalizadosBusqueda" class="form-control gestionEventosInput"
                                                type="text" placeholder="Ingrese el dato indicado"
                                                aria-label="Ingrese el dato indicado">
                                        </div>

                                        <div class="col-12 col-sm-auto d-grid d-sm-inline-flex">
                                            <button class="btn gestionEventosSearchBtn" type="button" aria-label="Buscar">
                                                <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-12 mt-4 fw-bold d-flex justify-content-end">
                                    <p id="eventosFinalizadosEditorConteo">0 eventos finalizados</p>
                                </div>
                            </div>
                        </div>

                        <div class="cardsEventosFinalizadosEditor container-fluid mt-3" id="cardsEventosFinalizadosEditor"></div>
                </div>

            `,
        },
        'crear-lista-difusion': {
            title: 'Crear lista de difusión',
            html: `
                <nav class="breadcrumbEventos" aria-label="breadcrumb">
                        <ol class="breadcrumb">
                            <li class="breadcrumb-item"><a class="text-decoration-none"
                                href="../modulo-admin.html">Inicio</a>
                            </li>
                            <li class="breadcrumb-item"><a class="text-decoration-none" href="#">Eventos</a></li>
                            <li class="breadcrumb-item active" aria-current="page">Crear lista de difusión
                            </li>
                        </ol>
                    </nav>
                    <div class="container-fluid">
                            <div class="row d-flex flex-column gap-4 mt-5">
                                <div class="col-12 d-flex justify-content-center align-items-center">
                                    <h2 class="fw-bold">Lista de Difusión</h2>
                                </div>
                                <div class="col-12 d-flex justify-content-center align-items-center">
                                    <p class="txtCrearLista">Información de la Lista</p>
                                </div>
                                <div class="col-12 d-flex justify-content-center align-items-center">
                                    <form id="formCrearListaDifusion" class="w-100" style="max-width: 800px;" novalidate>
                                        <div class="mb-4">
                                            <div class="row align-items-center">
                                                <label for="nombreLista" class="col-12 col-lg-3 form-label ">*Nombre de la lista</label>
                                                <div class="col-12 col-lg-9">
                                                    <input type="text" class="form-control" id="nombreLista" placeholder="Introduzca el dato solicitado" required>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="mb-4">
                                            <div class="row align-items-start">
                                                <label for="descripcionLista" class="col-12 col-lg-3 form-label">*Descripción de la lista de difusión</label>
                                                <div class="col-12 col-lg-9">
                                                    <textarea class="form-control" id="descripcionLista" rows="5" placeholder="Introduzca el dato solicitado" required></textarea>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="d-flex justify-content-center">
                                            <button type="submit" class="btn btnCrearLista">
                                                <i class="fa-solid fa-circle-check me-2" aria-hidden="true"></i>Crear
                                            </button>
                                        </div>
                                    </form>
                                </div>
                                </div>
                            </div>
                        </div>

            `,
        },
        'listas-difusion': {
            title: 'Listas de Difusion',
            html: `
                <nav class="breadcrumbEventos" aria-label="breadcrumb">
                        <ol class="breadcrumb">
                            <li class="breadcrumb-item"><a class="text-decoration-none"
                                href="../modulo-admin.html">Inicio</a>
                            </li>
                            <li class="breadcrumb-item"><a class="text-decoration-none" href="#">Eventos</a></li>
                            <li class="breadcrumb-item active" aria-current="page">Listas de difusión
                            </li>
                        </ol>
                    </nav>
                    <div class="container-fluid">
                            <div class="row mt-5">
                                <div
                                    class="col-12 d-flex justify-content-start align-items-center gap-2 gap-sm-3 mt-4 aprobacionEventosTitle">
                                    <div class="iconoAprobacionEventos">
                                        <i class="fa-solid fa-file-circle-check"></i>
                                    </div>
                                    <p class="txtAprobacionEventos mb-0">Listas de Difusión</p>
                                </div>
                                <div class="col-12 d-flex flex-column flex-lg-row justify-content-center align-items-center gap-2 gap-sm-3 mt-4 aprobacionEventosSubtitle">
                                    <button type="button" class="btn btnListasDifusionEdit btnlistasEnAprobado is-active" data-status="edicion">Aprobadas</button>
                                    <button type="button" class="btn btnListasDifusionEdit btnlistasEnPendiente" data-status="pendiente">Pendientes de Aprobación</button>
                                    <button type="button" class="btn btnListasDifusionEdit btnlistasEnRechazado" data-status="rechazado">Rechazadas</button>
                                </div>
                                <div class="col-12 buscadorEventosTitle mt-4 mb-2">
                                    <p>Buscador de Listas de Difusión</p>
                                </div>
                                <div class="col-12 buscadorEventosSubtitle mb-2">
                                    Filtrar por:
                                </div>
                                <div class="col-12 mb-4">
                                    <div class="row g-2 align-items-center">
                                        <div class="col-12 col-sm-4 col-md-auto">
                                            <label class="visually-hidden" for="gestionEventosFiltro">Filtro de
                                                eventos</label>
                                            <select id="gestionEventosFiltro" class="form-select gestionEventosSelect"
                                                aria-label="Tipo de filtro">
                                                <option selected>Título de la lista</option>
                                                <option>Fecha de la lista</option>
                                                <option>Autor de la lista</option>
                                            </select>
                                        </div>

                                        <div class="col-12 col-sm">
                                            <label class="visually-hidden" for="gestionEventosBusqueda">Dato a
                                                buscar</label>
                                            <input id="gestionEventosBusqueda" class="form-control gestionEventosInput"
                                                type="text" placeholder="Ingrese el dato indicado"
                                                aria-label="Ingrese el dato indicado">
                                        </div>

                                        <div class="col-12 col-sm-auto d-grid d-sm-inline-flex">
                                            <button class="btn gestionEventosSearchBtn" type="button" aria-label="Buscar">
                                                <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-12 mt-4 fw-bold d-flex justify-content-end">
                                    <p>1-20 de 57</p>
                                </div>
                            </div>
                        </div>

                        <div class="cardsEventosBorrador  container-fluid mt-3" id="cardsEventosBorrador">

                        </div>  
                    </div>
            
            `,
        },
        'suscriptores': {
            title: 'Suscriptores',
            html: `
                <nav class="breadcrumbEventos" aria-label="breadcrumb">
                        <ol class="breadcrumb">
                            <li class="breadcrumb-item"><a class="text-decoration-none"
                                href="../modulo-admin.html">Inicio</a>
                            </li>
                            <li class="breadcrumb-item"><a class="text-decoration-none" href="#">Eventos</a></li>
                            <li class="breadcrumb-item active" aria-current="page">Suscriptores
                            </li>
                        </ol>
                    </nav>
                    <div class="container-fluid">
                            <div class="row mt-5">
                                <div
                                    class="col-12 d-flex justify-content-start align-items-center gap-2 gap-sm-3 mt-4 aprobacionEventosTitle">
                                    <div class="iconoAprobacionEventos">
                                        <i class="fa-solid fa-people-group"></i>
                                    </div>
                                    <p class="txtAprobacionEventos mb-0">Suscriptores</p>
                                </div>
                                <div class="col-12 d-flex flex-column flex-lg-row justify-content-center align-items-center gap-2 gap-sm-3 mt-4 aprobacionEventosSubtitle">
                                    <button type="button" class="btn btnListasDifusionEdit btnlistasEnAprobado is-active" data-status="edicion">Aprobados</button>
                                    <button type="button" class="btn btnListasDifusionEdit btnlistasEnPendiente" data-status="pendiente">Pendientes de Aprobación</button>
                                    <button type="button" class="btn btnListasDifusionEdit btnlistasEnRechazado" data-status="rechazado">Rechazados</button>
                                </div>
                                <div class="col-12 buscadorEventosTitle mt-4 mb-2">
                                    <p>Buscador de Suscriptores</p>
                                </div>
                                <div class="col-12 buscadorEventosSubtitle mb-2">
                                    Filtrar por:
                                </div>
                                <div class="col-12 mb-4">
                                    <div class="row g-2 align-items-center">
                                        <div class="col-12 col-sm-4 col-md-auto">
                                            <label class="visually-hidden" for="gestionEventosFiltro">Filtro de
                                                eventos</label>
                                            <select id="gestionEventosFiltro" class="form-select gestionEventosSelect"
                                                aria-label="Tipo de filtro">
                                                <option selected>Nombre del Suscriptor</option>
                                                <option>Oficio</option>
                                                <option>Lista de difusión</option>
                                            </select>
                                        </div>

                                        <div class="col-12 col-sm">
                                            <label class="visually-hidden" for="gestionEventosBusqueda">Dato a
                                                buscar</label>
                                            <input id="gestionEventosBusqueda" class="form-control gestionEventosInput"
                                                type="text" placeholder="Ingrese el dato indicado"
                                                aria-label="Ingrese el dato indicado">
                                        </div>

                                        <div class="col-12 col-sm-auto d-grid d-sm-inline-flex">
                                            <button class="btn gestionEventosSearchBtn" type="button" aria-label="Buscar">
                                                <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-12 mt-4 fw-bold d-flex justify-content-end">
                                    <p id="suscriptoresEditorConteo">Cargando...</p>
                                </div>
                            </div>
                        </div>

                        <div class="cardsSuscriptoresEditor container-fluid mt-3" id="cardsSuscriptoresEditor">

                        </div>  

                        
            `,
        },
        'consultas': {
            title: 'Consultas',
            html: `
            <nav class="breadcrumbEventos" aria-label="breadcrumb">
                        <ol class="breadcrumb">
                            <li class="breadcrumb-item"><a class="text-decoration-none"
                                href="../modulo-admin.html">Inicio</a>
                            </li>
                            <li class="breadcrumb-item"><a class="text-decoration-none" href="#">Eventos</a></li>
                            <li class="breadcrumb-item active" aria-current="page">Consultas
                            </li>
                        </ol>
                    </nav>
                    <div class="container-fluid">
                            <div class="row mt-5">
                                <div
                                    class="col-12 d-flex justify-content-start align-items-center gap-2 gap-sm-3 mt-4 aprobacionEventosTitle">
                                    <div class="iconoAprobacionEventos">
                                        <i class="fa-regular fa-message"></i>
                                    </div>
                                    <p class="txtAprobacionEventos mb-0">Consultas de Eventos</p>
                                </div>
                                <div class="col-12 d-flex flex-column flex-lg-row justify-content-center align-items-center gap-2 gap-sm-3 mt-4 aprobacionEventosSubtitle consultasTabs">
                                    <button type="button" class="btn btnListasDifusionEdit btnlistasEnAprobado is-active" data-status="resueltas">Consultas Resueltas</button>
                                    <button type="button" class="btn btnListasDifusionEdit btnlistasEnPendiente" data-status="pendientes">Pendientes de respuestas</button>
                                </div>

                                <div class="col-12 buscadorEventosTitle mt-4 mb-2">
                                    <p>Buscador de Consultas</p>
                                </div>
                                <div class="col-12 buscadorEventosSubtitle mb-2">
                                    Filtrar por:
                                </div>
                                <div class="col-12 mb-4">
                                    <div class="row g-2 align-items-center">
                                        <div class="col-12 col-sm-4 col-md-auto">
                                            <label class="visually-hidden" for="gestionEventosFiltro">Filtro de
                                                eventos</label>
                                            <select id="gestionEventosFiltro" class="form-select gestionEventosSelect"
                                                aria-label="Tipo de filtro">
                                                <option selected>Título de Eventos</option>
                                                <option>Organizador</option>
                                                <option>Fecha del Evento</option>
                                            </select>
                                        </div>

                                        <div class="col-12 col-sm">
                                            <label class="visually-hidden" for="gestionEventosBusqueda">Dato a
                                                buscar</label>
                                            <input id="gestionEventosBusqueda" class="form-control gestionEventosInput"
                                                type="text" placeholder="Ingrese el dato indicado"
                                                aria-label="Ingrese el dato indicado">
                                        </div>

                                        <div class="col-12 col-sm-auto d-grid d-sm-inline-flex">
                                            <button class="btn gestionEventosSearchBtn" type="button" aria-label="Buscar">
                                                <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-12 mt-4 fw-bold d-flex justify-content-end">
                                    <p id="consultasEditorConteo">1- 20 de 57</p>
                                </div>
                            </div>
                        </div>

                        <div class="cardsConsultasEditor container-fluid mt-3" id="cardsConsultasEditor">

                        </div>      
            
            `,
        },
        'aprobacion-inscripciones': {
            title: 'Aprobación de Inscripciones',
            html: `
            <nav class="breadcrumbEventos" aria-label="breadcrumb">
                        <ol class="breadcrumb" id="breadcrumbAprobacionInscripciones">
                            <li class="breadcrumb-item"><a class="text-decoration-none"
                                href="../modulo-editor.html">Inicio</a>
                            </li>
                            <li class="breadcrumb-item"><a class="text-decoration-none" href="#">Usuarios</a></li>
                            <li class="breadcrumb-item active" aria-current="page">Aprobación de Inscripciones
                            </li>
                        </ol>
                    </nav>
                    <div class="container-fluid">
                            <div class="row mt-5">
                                <div
                                    class="col-12 d-flex justify-content-start align-items-center gap-2 gap-sm-3 mt-4 aprobacionEventosTitle">
                                    <div class="iconoAprobacionEventos" id="aprobacionInscripcionesIconoWrap">
                                         <i class="fa-regular fa-circle"></i>
                                    </div>
                                    <p class="txtAprobacionEventos mb-0" id="aprobacionInscripcionesTitulo">Seleccionar Evento</p>
                                </div>
                                <div class="col-12 buscadorEventosTitle mt-4 mb-2" id="aprobacionInscripcionesBuscadorWrap">
                                    <p id="aprobacionInscripcionesBuscadorTitulo">Buscador de Eventos</p>
                                </div>
                                <div class="col-12 buscadorEventosSubtitle mb-2" id="aprobacionInscripcionesFiltroLabelWrap">
                                    Filtrar por:
                                </div>
                                <div class="col-12 mb-4" id="aprobacionInscripcionesFiltroWrap">
                                    <div class="row g-2 align-items-center">
                                        <div class="col-12 col-sm-4 col-md-auto">
                                            <label class="visually-hidden" for="gestionInscripcionesFiltro">Filtro de
                                                usuarios</label>
                                            <select id="gestionInscripcionesFiltro" class="form-select gestionEventosSelect"
                                                aria-label="Tipo de filtro">
                                                <option selected>Nombre de Usuario</option>
                                                <option>Profesión</option>
                                                <option>Tipo de deficiencia</option>
                                            </select>
                                        </div>
                                        <div class="col-12 col-sm">
                                            <label class="visually-hidden" for="gestionInscripcionesBusqueda">Dato a
                                                buscar</label>
                                            <input id="gestionInscripcionesBusqueda" class="form-control gestionEventosInput"
                                                type="text" placeholder="Ingrese el dato indicado"
                                                aria-label="Ingrese el dato indicado">
                                        </div>

                                        <div class="col-12 col-sm-auto d-grid d-sm-inline-flex">
                                            <button class="btn gestionEventosSearchBtn" type="button" aria-label="Buscar" id="gestionInscripcionesBuscarBtn">
                                                <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-12 mt-4 fw-bold d-flex justify-content-end" id="aprobacionInscripcionesConteoWrap">
                                    <p id="inscripcionesPendientesConteo">0 inscripciones pendientes</p>
                                </div>
                            </div>
                        </div>

                        <div class="cardsInscripcionesPendientesEditor container-fluid mt-3" id="cardsInscripcionesPendientesEditor"></div>

                        <div class="modal fade" id="modalRechazoInscripcion" tabindex="-1" aria-hidden="true">
                            <div class="modal-dialog modal-dialog-centered modalRechazoListaDifusionAncho">
                                <div class="modal-content modalRechazoListaDifusionContenido">
                                    <div class="modal-body modalRechazoListaDifusionBody">
                                        <p class="modalRechazoListaDifusionTitulo">Rechazo de Inscripción</p>
                                        <p class="modalRechazoListaDifusionDescripcion" id="modalRechazoInscripcionDescripcion">
                                            Para realizar el rechazo de una inscripción, favor indicar el motivo por el cual fue rechazada en el recuadro siguiente. Este será enviado a la persona inscrita.
                                        </p>
                                        <textarea id="modalRechazoInscripcionMotivo" class="form-control modalRechazoSuscriptorTextarea" maxlength="300" placeholder="Introduzca el motivo del rechazo"></textarea>
                                        <div class="modalRechazoListaDifusionAcciones d-grid gap-3 d-md-flex justify-content-center my-4">
                                            <button type="button" class="btn modalRechazoListaDifusionBtnCancelar px-4" data-bs-dismiss="modal">Cancelar</button>
                                            <button type="button" class="btn modalRechazoListaDifusionBtnAceptar px-4" id="modalRechazoInscripcionAceptarBtn">Aceptar</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="modal fade" id="modalConfirmacionRechazoInscripcion" tabindex="-1" aria-hidden="true">
                            <div class="modal-dialog modal-dialog-centered modalEliminarEventoAncho">
                                <div class="modal-content modalEliminarEventoContenido">
                                    <div class="modal-body modalEliminarEventoBody">
                                        <p class="modalEliminarEventoTitulo">¿Rechazar?</p>
                                        <p class="modalEliminarEventoDescripcion">
                                            Al rechazar una inscripción, esta no podrá ser aprobada para el evento, ¿está seguro que desea continuar con este proceso?
                                        </p>
                                        <div class="modalEliminarEventoAcciones d-grid gap-3 d-md-flex justify-content-center my-3">
                                            <button type="button" class="btn modalEliminarEventoBtnCancelar px-4" data-bs-dismiss="modal">Cancelar</button>
                                            <button type="button" class="btn modalEliminarEventoBtnEliminar px-4" id="modalConfirmacionRechazoInscripcionBtn">Rechazar</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="modal fade" id="modalInscripcionAprobada" tabindex="-1" aria-hidden="true">
                            <div class="modal-dialog modal-dialog-centered modalSuscripcionEnviadaAncho">
                                <div class="modal-content modalSuscripcionEnviadaContenido">
                                    <div class="modal-body modalSuscripcionEnviadaBody">
                                        <div class="modalSuscripcionEnviadaIcono" aria-hidden="true">
                                            <i class="fa-solid fa-check"></i>
                                        </div>
                                        <p class="modalSuscripcionEnviadaTitulo">Inscripción Aprobada</p>
                                        <p class="modalSuscripcionEnviadaDescripcion">
                                            Se aprobó con éxito la inscripción seleccionada. La persona inscrita será notificada del estado de su solicitud.
                                        </p>
                                        <button type="button" class="btn modalSuscripcionEnviadaBtnContinuar" data-bs-dismiss="modal">Continuar</button>
                                    </div>
                                </div>
                            </div>
                        </div>
            `,
        },
        'inscritos-eventos': {
            title: 'Inscritos a eventos',
            html: `
            <nav class="breadcrumbEventos" aria-label="breadcrumb">
                        <ol class="breadcrumb" id="breadcrumbInscritosEventos">
                            <li class="breadcrumb-item"><a class="text-decoration-none"
                                href="../modulo-editor.html">Inicio</a>
                            </li>
                            <li class="breadcrumb-item"><a class="text-decoration-none" href="#">Usuarios</a></li>
                            <li class="breadcrumb-item active" aria-current="page">Inscritos a Eventos
                            </li>
                        </ol>
                    </nav>
                    <div class="container-fluid">
                            <div class="row mt-5">
                                <div
                                    class="col-12 d-flex justify-content-start align-items-center gap-2 gap-sm-3 mt-4 aprobacionEventosTitle">
                                    <div class="iconoAprobacionEventos" id="inscritosEventosIconoWrap">
                                         <i class="fa-regular fa-circle"></i>
                                    </div>
                                    <p class="txtAprobacionEventos mb-0" id="inscritosEventosTitulo">Seleccionar Evento</p>
                                </div>
                                <div class="col-12 buscadorEventosTitle mt-4 mb-2" id="inscritosEventosBuscadorWrap">
                                    <p id="inscritosEventosBuscadorTitulo">Buscador de Eventos</p>
                                </div>
                                <div class="col-12 buscadorEventosSubtitle mb-2" id="inscritosEventosFiltroLabelWrap">
                                    Filtrar por:
                                </div>
                                <div class="col-12 mb-4" id="inscritosEventosFiltroWrap">
                                    <div class="row g-2 align-items-center">
                                        <div class="col-12 col-sm-4 col-md-auto">
                                            <label class="visually-hidden" for="gestionInscritosEventosFiltro">Filtro de
                                                usuarios</label>
                                            <select id="gestionInscritosEventosFiltro" class="form-select gestionEventosSelect"
                                                aria-label="Tipo de filtro">
                                                <option selected>Nombre de Usuario</option>
                                                <option>Profesión</option>
                                                <option>Tipo de deficiencia</option>
                                            </select>
                                        </div>
                                        <div class="col-12 col-sm">
                                            <label class="visually-hidden" for="gestionInscritosEventosBusqueda">Dato a
                                                buscar</label>
                                            <input id="gestionInscritosEventosBusqueda" class="form-control gestionEventosInput"
                                                type="text" placeholder="Ingrese el dato indicado"
                                                aria-label="Ingrese el dato indicado">
                                        </div>

                                        <div class="col-12 col-sm-auto d-grid d-sm-inline-flex">
                                            <button class="btn gestionEventosSearchBtn" type="button" aria-label="Buscar" id="gestionInscritosEventosBuscarBtn">
                                                <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-12 mt-4 fw-bold d-flex justify-content-end" id="inscritosEventosConteoWrap">
                                    <p id="inscritosEventosConteo">0 usuarios inscritos</p>
                                </div>
                            </div>
                        </div>

                        <div class="cardsInscripcionesPendientesEditor container-fluid mt-3" id="cardsInscritosEventosEditor"></div>
            `,
        },
    };

    let activeSidebarKey = null;
    let hasDraftChanges = false;
    let pendingNavigationLink = null;
    let leaveDraftModalInstance = null;
    let deleteEventModalInstance = null;
    let openingDeleteConfirmation = false;
    let deleteConfirmed = false;
    const finalizadosState = {
        eventos: [],
        filtroTexto: '',
        filtroSeleccionado: 'Título del Evento',
    };

    const inscripcionesPendientesState = {
        inscripciones: [],
        eventosAprobados: [],
        eventosById: new Map(),
        eventoSeleccionadoId: '',
        inscripcionSeleccionadaId: '',
        inscripcionRechazoPendienteId: '',
        filtroTexto: '',
        filtroSeleccionado: 'Nombre de Usuario',
    };

    const inscritosEventosState = {
        inscripcionesAprobadas: [],
        eventosAprobados: [],
        eventosById: new Map(),
        eventoSeleccionadoId: '',
        inscripcionSeleccionadaId: '',
        filtroTexto: '',
        filtroSeleccionado: 'Nombre de Usuario',
    };

    const escapeHtml = (text) => {
        if (text === null || text === undefined) {
            return '';
        }

        return String(text)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#39;');
    };

    const normalizarTexto = (value) => {
        return String(value || '')
            .normalize('NFD')
            .replaceAll(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();
    };

    const parseFinalizadosFecha = (fecha) => {
        if (!fecha) {
            return null;
        }

        if (fecha instanceof Date) {
            return Number.isNaN(fecha.getTime()) ? null : fecha;
        }

        if (typeof fecha === 'string') {
            const date = new Date(fecha);
            return Number.isNaN(date.getTime()) ? null : date;
        }

        if (typeof fecha !== 'object') {
            return null;
        }

        const anio = Number.parseInt(fecha.anio, 10);
        const mes = Number.parseInt(fecha.mes, 10);
        const dia = Number.parseInt(fecha.dia, 10);

        if (!Number.isNaN(anio) && !Number.isNaN(mes) && !Number.isNaN(dia)) {
            const date = new Date(anio, mes - 1, dia);
            return Number.isNaN(date.getTime()) ? null : date;
        }

        if (fecha.iso) {
            const isoDate = new Date(fecha.iso);
            return Number.isNaN(isoDate.getTime()) ? null : isoDate;
        }

        return null;
    };

    const formatFinalizadosFecha = (fecha) => {
        const parsedDate = parseFinalizadosFecha(fecha);

        if (!parsedDate) {
            return 'N/A';
        }

        return parsedDate.toLocaleDateString('es-CR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const obtenerFechaFinalizadaPrincipal = (evento) => {
        const fechasEvento = Array.isArray(evento?.fechasEvento) ? evento.fechasEvento : [];
        const fechasValidas = fechasEvento
            .map((fecha) => parseFinalizadosFecha(fecha))
            .filter(Boolean)
            .sort((a, b) => a - b);

        if (fechasValidas.length > 0) {
            return fechasValidas[fechasValidas.length - 1];
        }

        return parseFinalizadosFecha(evento?.fechaFinVisualizacion)
            || parseFinalizadosFecha(evento?.fechaPublicacion)
            || parseFinalizadosFecha(evento?.updatedAt)
            || null;
    };

    const getFinalizadosFilterValue = (evento, filtroSeleccionado) => {
        if (filtroSeleccionado === 'Fecha del Evento') {
            return formatFinalizadosFecha(obtenerFechaFinalizadaPrincipal(evento));
        }

        if (filtroSeleccionado === 'Nombre del Editor') {
            return evento?.contacto?.nombreCompleto || '';
        }

        return evento?.nombreEvento || '';
    };

    const compareFinalizadosByFilter = (a, b, filtroSeleccionado) => {
        if (filtroSeleccionado === 'Fecha del Evento') {
            const dateA = obtenerFechaFinalizadaPrincipal(a);
            const dateB = obtenerFechaFinalizadaPrincipal(b);
            const timeA = dateA instanceof Date && !Number.isNaN(dateA.getTime()) ? dateA.getTime() : Number.MAX_SAFE_INTEGER;
            const timeB = dateB instanceof Date && !Number.isNaN(dateB.getTime()) ? dateB.getTime() : Number.MAX_SAFE_INTEGER;

            return timeB - timeA;
        }

        const valueA = normalizarTexto(getFinalizadosFilterValue(a, filtroSeleccionado));
        const valueB = normalizarTexto(getFinalizadosFilterValue(b, filtroSeleccionado));
        return valueA.localeCompare(valueB, 'es', { sensitivity: 'base' });
    };

    const aplicarFiltrosFinalizados = () => {
        const filtroSelect = document.getElementById('gestionEventosFinalizadosFiltro');
        const terminoBusqueda = normalizarTexto(finalizadosState.filtroTexto);
        const filtroSeleccionado = filtroSelect?.value || finalizadosState.filtroSeleccionado || 'Título del Evento';
        finalizadosState.filtroSeleccionado = filtroSeleccionado;

        const ordenados = [...finalizadosState.eventos].sort((a, b) => compareFinalizadosByFilter(a, b, filtroSeleccionado));

        if (!terminoBusqueda) {
            return {
                ordered: ordenados,
                matches: ordenados.length,
                total: ordenados.length,
            };
        }

        const matches = [];
        const restantes = [];

        ordenados.forEach((evento) => {
            const valor = normalizarTexto(getFinalizadosFilterValue(evento, filtroSeleccionado));

            if (valor.includes(terminoBusqueda)) {
                matches.push(evento);
            } else {
                restantes.push(evento);
            }
        });

        return {
            ordered: [...matches, ...restantes],
            matches: matches.length,
            total: ordenados.length,
        };
    };

    const renderEventosFinalizados = (eventos = [], filterStats = null) => {
        const container = document.getElementById('cardsEventosFinalizadosEditor');
        const conteo = document.getElementById('eventosFinalizadosEditorConteo');

        if (!container) {
            return;
        }

        if (conteo) {
            if (filterStats && normalizarTexto(finalizadosState.filtroTexto)) {
                conteo.textContent = `${filterStats.matches} coincidencia(s) de ${filterStats.total} eventos finalizados`;
            } else {
                conteo.textContent = `${eventos.length} eventos finalizados`;
            }
        }

        if (!Array.isArray(eventos) || eventos.length === 0) {
            container.innerHTML = `
                <div class="row mt-3">
                    <div class="col-12">
                        <p class="text-muted">No hay eventos finalizados.</p>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = eventos.map((evento) => {
            const eventId = escapeHtml(evento?._id || '');
            const titulo = escapeHtml(evento?.nombreEvento || 'Sin título');
            const fechaCreacion = formatFinalizadosFecha(evento?.createdAt);
            const fechaFinalizacion = formatFinalizadosFecha(obtenerFechaFinalizadaPrincipal(evento));

            return `
                <div class="row border-bottom border-1 border-secondary-subtle py-3">
                    <div class="col-12">
                        <div class="eventoCardPublicada d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 p-3" aria-label="Evento finalizado">
                            <div class="eventoCardPublicadaHeader ms-lg-5">
                                <p class="eventoCardPublicadaTitulo fw-bold mb-1">${titulo}</p>
                                <p class="eventoCardPublicadaMeta mb-1"><span>Fecha de creación:</span> ${fechaCreacion}</p>
                                <p class="eventoCardPublicadaMeta mb-1"><span>Fecha final:</span> ${fechaFinalizacion}</p>
                            </div>

                            <div class="eventoCardPublicadaAcciones d-flex flex-wrap align-items-center gap-2 mt-2 mt-lg-0" aria-label="Acciones del evento finalizado">
                                <button class="btn btn-sm btn-outline-secondary px-3" type="button" aria-label="Agregar link de memoria" data-finalizado-accion="memoria" data-evento-id="${eventId}">
                                    Agregar Link de Memoria
                                </button>
                                <button class="btn eventoCardBtnIcon" type="button" aria-label="Ver evento" data-finalizado-accion="ver" data-evento-id="${eventId}">
                                    <i class="fa-regular fa-eye" aria-hidden="true"></i>
                                </button>
                                <button class="btn eventoCardBtnIcon" type="button" aria-label="Editar evento" data-finalizado-accion="editar" data-evento-id="${eventId}">
                                    <i class="fa-regular fa-pen-to-square" aria-hidden="true"></i>
                                </button>
                                <button class="btn eventoCardBtnIcon text-danger" type="button" aria-label="Eliminar evento" data-finalizado-accion="eliminar" data-evento-id="${eventId}">
                                    <i class="fa-regular fa-trash-can" aria-hidden="true"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    };

    const aplicarYRenderizarFinalizados = () => {
        const filteredResult = aplicarFiltrosFinalizados();
        renderEventosFinalizados(filteredResult.ordered, filteredResult);
    };

    const cargarEventosFinalizados = async () => {
        const container = document.getElementById('cardsEventosFinalizadosEditor');

        if (!container) {
            return;
        }

        container.innerHTML = '<p class="text-muted">Cargando eventos finalizados...</p>';

        try {
            const response = await fetch('/api/form-evento?estado=aprobado&estadoVigencia=eliminado');

            if (!response.ok) {
                throw new Error('No se pudieron cargar los eventos finalizados.');
            }

            const data = await response.json();
            finalizadosState.eventos = Array.isArray(data.eventos) ? data.eventos : [];
            aplicarYRenderizarFinalizados();
        } catch (error) {
            console.error('Error al cargar los eventos finalizados:', error);
            container.innerHTML = '<div class="alert alert-warning mb-0">No se pudieron cargar los eventos finalizados.</div>';
        }
    };

    const eliminarEventoFinalizado = async (eventoId) => {
        const response = await fetch(`/api/form-evento/${encodeURIComponent(eventoId)}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('No se pudo eliminar el evento.');
        }

        finalizadosState.eventos = finalizadosState.eventos.filter((evento) => String(evento?._id) !== String(eventoId));
        aplicarYRenderizarFinalizados();
    };

    const initEventosFinalizadosEditor = async () => {
        const filtroSelect = document.getElementById('gestionEventosFinalizadosFiltro');
        const busquedaInput = document.getElementById('gestionEventosFinalizadosBusqueda');
        const searchButton = contentPanel?.querySelector('.gestionEventosSearchBtn');
        const cardsContainer = document.getElementById('cardsEventosFinalizadosEditor');

        if (!cardsContainer) {
            return;
        }

        if (filtroSelect) {
            filtroSelect.value = finalizadosState.filtroSeleccionado;

            if (filtroSelect.dataset.finalizadosBound !== 'true') {
                filtroSelect.addEventListener('change', () => {
                    finalizadosState.filtroSeleccionado = filtroSelect.value || 'Título del Evento';
                    aplicarYRenderizarFinalizados();
                });

                filtroSelect.dataset.finalizadosBound = 'true';
            }
        }

        if (busquedaInput) {
            busquedaInput.value = finalizadosState.filtroTexto;

            if (busquedaInput.dataset.finalizadosBound !== 'true') {
                busquedaInput.addEventListener('input', () => {
                    finalizadosState.filtroTexto = busquedaInput.value || '';
                    aplicarYRenderizarFinalizados();
                });

                busquedaInput.dataset.finalizadosBound = 'true';
            }
        }

        if (searchButton && searchButton.dataset.finalizadosBound !== 'true') {
            searchButton.addEventListener('click', () => {
                finalizadosState.filtroTexto = busquedaInput?.value || '';
                aplicarYRenderizarFinalizados();
            });

            searchButton.dataset.finalizadosBound = 'true';
        }

        if (cardsContainer.dataset.finalizadosActionsBound !== 'true') {
            cardsContainer.addEventListener('click', async (event) => {
                const actionButton = event.target.closest('[data-finalizado-accion]');

                if (!actionButton) {
                    return;
                }

                const action = actionButton.dataset.finalizadoAccion;
                const eventoId = actionButton.dataset.eventoId;
                const eventoSeleccionado = finalizadosState.eventos.find((evento) => String(evento?._id) === String(eventoId));

                if (!eventoId) {
                    return;
                }

                if (action === 'ver') {
                    await globalThis.mostrarVistaPreviaEventoPorId?.(eventoId, 'evento');
                    return;
                }

                if (action === 'eliminar') {
                    if (!globalThis.confirm('¿Eliminar este evento finalizado?')) {
                        return;
                    }

                    try {
                        await eliminarEventoFinalizado(eventoId);
                    } catch (error) {
                        console.error('Error al eliminar el evento finalizado:', error);
                        globalThis.alert('No se pudo eliminar el evento.');
                    }

                    return;
                }
            });

            cardsContainer.dataset.finalizadosActionsBound = 'true';
        }

        await cargarEventosFinalizados();
    };

    const extraerEventoIdInscripcion = (inscripcion) => {
        const eventoRef = inscripcion?.eventoId;

        if (!eventoRef) {
            return '';
        }

        if (typeof eventoRef === 'string') {
            return eventoRef;
        }

        return eventoRef?._id || eventoRef?.id || '';
    };

    const obtenerNombreEventoInscripcion = (inscripcion, eventoDetalle) => {
        if (eventoDetalle?.nombreEvento) {
            return eventoDetalle.nombreEvento;
        }

        const eventoRef = inscripcion?.eventoId;
        if (typeof eventoRef === 'object' && eventoRef?.nombreEvento) {
            return eventoRef.nombreEvento;
        }

        return 'Evento sin título';
    };

    const obtenerFechaEventoInscripcion = (eventoDetalle) => {
        const fechasEvento = Array.isArray(eventoDetalle?.fechasEvento) ? eventoDetalle.fechasEvento : [];
        const fechasValidas = fechasEvento
            .map((fecha) => parseFinalizadosFecha(fecha))
            .filter(Boolean)
            .sort((a, b) => a - b);

        if (fechasValidas.length > 0) {
            return fechasValidas[0];
        }

        return parseFinalizadosFecha(eventoDetalle?.fechaPublicacion) || null;
    };

    const formatearFechaEventoInscripcion = (eventoDetalle) => {
        const fecha = obtenerFechaEventoInscripcion(eventoDetalle);

        if (!fecha) {
            return 'No disponible';
        }

        return fecha.toLocaleDateString('es-CR', {
            day: 'numeric',
            month: 'long',
        });
    };

    const obtenerOrganizadorEventoInscripcion = (eventoDetalle) => {
        return eventoDetalle?.contacto?.nombreCompleto
            || eventoDetalle?.organizador
            || 'No disponible';
    };

    const getInscripcionFilterValue = (inscripcion, filtroSeleccionado) => {
        if (filtroSeleccionado === 'Profesión') {
            return inscripcion?.profesion || '';
        }

        if (filtroSeleccionado === 'Tipo de deficiencia') {
            return inscripcion?.tipoDeficiencia || '';
        }

        return inscripcion?.nombreCompleto || '';
    };

    const getEventoAprobadoFilterValue = (evento, filtroSeleccionado) => {
        if (filtroSeleccionado === 'Organizador') {
            return evento?.contacto?.nombreCompleto || '';
        }

        if (filtroSeleccionado === 'Fecha del Evento') {
            return formatearFechaEventoInscripcion(evento);
        }

        return evento?.nombreEvento || '';
    };

    const configurarUIAprobacionInscripciones = () => {
        const titulo = document.getElementById('aprobacionInscripcionesTitulo');
        const buscadorTitulo = document.getElementById('aprobacionInscripcionesBuscadorTitulo');
        const filtroSelect = document.getElementById('gestionInscripcionesFiltro');
        const breadcrumb = document.getElementById('breadcrumbAprobacionInscripciones');
        const iconoWrap = document.getElementById('aprobacionInscripcionesIconoWrap');
        const buscadorWrap = document.getElementById('aprobacionInscripcionesBuscadorWrap');
        const filtroLabelWrap = document.getElementById('aprobacionInscripcionesFiltroLabelWrap');
        const filtroWrap = document.getElementById('aprobacionInscripcionesFiltroWrap');
        const conteoWrap = document.getElementById('aprobacionInscripcionesConteoWrap');

        const modoEvento = !inscripcionesPendientesState.eventoSeleccionadoId;
        const modoDetalle = Boolean(inscripcionesPendientesState.inscripcionSeleccionadaId);
        const inscripcionSeleccionada = inscripcionesPendientesState.inscripciones
            .find((inscripcion) => String(inscripcion?._id) === String(inscripcionesPendientesState.inscripcionSeleccionadaId));

        if (titulo) {
            if (modoEvento) {
                titulo.textContent = 'Seleccionar Evento';
            } else if (modoDetalle) {
                titulo.textContent = inscripcionSeleccionada?.nombreCompleto || 'Detalle de Inscripción';
            } else {
                titulo.textContent = 'Inscripciones Pendientes';
            }
        }

        if (buscadorTitulo) {
            buscadorTitulo.textContent = modoEvento ? 'Buscador de Eventos' : 'Buscador de Usuarios';
        }

        const mostrarBuscador = !modoDetalle;
        if (buscadorWrap) buscadorWrap.classList.toggle('d-none', !mostrarBuscador);
        if (filtroLabelWrap) filtroLabelWrap.classList.toggle('d-none', !mostrarBuscador);
        if (filtroWrap) filtroWrap.classList.toggle('d-none', !mostrarBuscador);
        if (conteoWrap) conteoWrap.classList.toggle('d-none', !mostrarBuscador);

        if (breadcrumb) {
            breadcrumb.innerHTML = modoEvento
                ? `
                    <li class="breadcrumb-item"><a class="text-decoration-none" href="../modulo-editor.html">Inicio</a></li>
                    <li class="breadcrumb-item"><a class="text-decoration-none" href="#" data-inscripcion-nav="usuarios">Usuarios</a></li>
                    <li class="breadcrumb-item active" aria-current="page">Aprobación de Inscripciones</li>
                `
                : modoDetalle
                    ? `
                        <li class="breadcrumb-item"><a class="text-decoration-none" href="../modulo-editor.html">Inicio</a></li>
                        <li class="breadcrumb-item"><a class="text-decoration-none" href="#" data-inscripcion-nav="usuarios">Usuarios</a></li>
                        <li class="breadcrumb-item"><a class="text-decoration-none" href="#" data-inscripcion-nav="aprobacion">Aprobación de Inscripciones</a></li>
                        <li class="breadcrumb-item"><a class="text-decoration-none" href="#" data-inscripcion-nav="inscripciones">Inscripciones Pendientes</a></li>
                        <li class="breadcrumb-item active" aria-current="page">Detalle</li>
                    `
                    : `
                        <li class="breadcrumb-item"><a class="text-decoration-none" href="../modulo-editor.html">Inicio</a></li>
                        <li class="breadcrumb-item"><a class="text-decoration-none" href="#" data-inscripcion-nav="usuarios">Usuarios</a></li>
                        <li class="breadcrumb-item"><a class="text-decoration-none" href="#" data-inscripcion-nav="aprobacion">Aprobación de Inscripciones</a></li>
                        <li class="breadcrumb-item active" aria-current="page">Inscripciones Pendientes</li>
                    `;
        }

        if (iconoWrap) {
            iconoWrap.innerHTML = modoEvento
                ? '<i class="fa-regular fa-circle"></i>'
                : '<i class="fa-regular fa-user"></i>';
        }

        if (!filtroSelect || modoDetalle) {
            return;
        }

        const opciones = modoEvento
            ? ['Título del Evento', 'Organizador', 'Fecha del Evento']
            : ['Nombre de Usuario', 'Profesión', 'Tipo de deficiencia'];

        const opcionValida = opciones.includes(inscripcionesPendientesState.filtroSeleccionado)
            ? inscripcionesPendientesState.filtroSeleccionado
            : opciones[0];

        filtroSelect.innerHTML = opciones
            .map((opcion) => `<option value="${escapeHtml(opcion)}">${escapeHtml(opcion)}</option>`)
            .join('');

        filtroSelect.value = opcionValida;
        inscripcionesPendientesState.filtroSeleccionado = opcionValida;
    };

    const renderSeleccionEventosInscripciones = () => {
        const container = document.getElementById('cardsInscripcionesPendientesEditor');
        const conteo = document.getElementById('inscripcionesPendientesConteo');

        if (!container) {
            return;
        }

        const listaBase = Array.isArray(inscripcionesPendientesState.eventosAprobados)
            ? [...inscripcionesPendientesState.eventosAprobados]
            : [];
        const terminoBusqueda = normalizarTexto(inscripcionesPendientesState.filtroTexto);
        const filtroSeleccionado = inscripcionesPendientesState.filtroSeleccionado || 'Título del Evento';

        const eventosFiltrados = !terminoBusqueda
            ? listaBase
            : listaBase.filter((evento) => {
                const valorFiltro = normalizarTexto(getEventoAprobadoFilterValue(evento, filtroSeleccionado));
                return valorFiltro.includes(terminoBusqueda);
            });

        if (conteo) {
            if (terminoBusqueda) {
                conteo.textContent = `${eventosFiltrados.length} coincidencia(s) de ${listaBase.length} eventos aprobados`;
            } else {
                conteo.textContent = `${eventosFiltrados.length} eventos aprobados`;
            }
        }

        if (!eventosFiltrados.length) {
            container.innerHTML = '<p class="text-muted">No hay eventos aprobados para mostrar.</p>';
            return;
        }

        container.innerHTML = `
            <div class="row g-4">
                ${eventosFiltrados.map((evento) => {
                    const eventoId = escapeHtml(evento?._id || '');
                    const nombreEvento = escapeHtml(evento?.nombreEvento || 'Evento sin título');
                    const fechaEvento = escapeHtml(formatearFechaEventoInscripcion(evento));
                    const organizador = escapeHtml(obtenerOrganizadorEventoInscripcion(evento));

                    return `
                        <div class="col-12 col-md-6">
                            <article class="selectorEventoCard" aria-label="Evento aprobado">
                                <div class="selectorEventoCardBody">
                                    <p class="selectorEventoCardTitulo">${nombreEvento}</p>
                                    <p class="selectorEventoCardMeta"><strong>Fecha del Evento:</strong> ${fechaEvento}</p>
                                    <p class="selectorEventoCardMeta"><strong>Organizador:</strong> ${organizador}</p>
                                </div>
                                <button class="btn selectorEventoCardArrow" type="button" aria-label="Ver inscripciones del evento" data-inscripcion-accion="seleccionar-evento" data-evento-id="${eventoId}">
                                    <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
                                </button>
                            </article>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    };

    const construirDetalleInscripcionTexto = (inscripcion, eventoDetalle) => {
        const lineas = [
            `Evento: ${obtenerNombreEventoInscripcion(inscripcion, eventoDetalle)}`,
            `Nombre: ${inscripcion?.nombreCompleto || 'No disponible'}`,
            `Correo electrónico: ${inscripcion?.correoElectronico || 'No disponible'}`,
            `Teléfono: ${inscripcion?.telefono || 'No disponible'}`,
            `Profesión: ${inscripcion?.profesion || 'No disponible'}`,
            `Entidad: ${inscripcion?.entidadTrabajo || 'No disponible'}`,
            `Tipo de deficiencia: ${inscripcion?.tipoDeficiencia || 'No disponible'}`,
            `Estado: ${inscripcion?.estado || 'pendiente_aprobacion'}`,
        ];

        return lineas.join('\n');
    };

    const formatearBooleanoInscripcion = (valor) => {
        if (valor === 'si' || valor === true) {
            return 'Sí';
        }

        if (valor === 'no' || valor === false) {
            return 'No';
        }

        return 'No disponible';
    };

    const renderDetalleInscripcionSeleccionada = () => {
        const container = document.getElementById('cardsInscripcionesPendientesEditor');

        if (!container) {
            return;
        }

        const inscripcion = inscripcionesPendientesState.inscripciones
            .find((item) => String(item?._id) === String(inscripcionesPendientesState.inscripcionSeleccionadaId));

        if (!inscripcion) {
            inscripcionesPendientesState.inscripcionSeleccionadaId = '';
            renderInscripcionesPendientes();
            return;
        }

        const rows = [
            ['Correo Electrónico', inscripcion?.correoElectronico || 'No disponible'],
            ['Profesión u Oficio', inscripcion?.profesion || 'No disponible'],
            ['Entidad para la que trabaja o está vinculado', inscripcion?.entidadTrabajo || 'No disponible'],
            ['Tipo de Deficiencia', inscripcion?.tipoDeficiencia || 'No disponible'],
            ['Requiere Intérprete LESCO', formatearBooleanoInscripcion(inscripcion?.requiereInterprete)],
            ['Alimentación', inscripcion?.requerimientosAlimentacion || 'No disponible'],
        ];

        container.innerHTML = `
            <article class="inscripcionDetalleVista" aria-label="Detalle de inscripción">
                <div class="inscripcionDetalleTablaWrap">
                    <table class="inscripcionDetalleTabla" aria-label="Información del usuario inscrito">
                        <tbody>
                            ${rows.map(([label, value]) => `
                                <tr>
                                    <th scope="row">${escapeHtml(label)}:</th>
                                    <td>${escapeHtml(value)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <div class="inscripcionDetalleAcciones" aria-label="Acciones de la inscripción">
                    <button class="btn inscripcionDetalleBtn inscripcionDetalleBtnSecundario" type="button" data-inscripcion-accion="rechazar" data-inscripcion-id="${escapeHtml(inscripcion?._id || '')}">
                        <i class="fa-solid fa-circle-xmark" aria-hidden="true"></i>
                        Rechazar
                    </button>
                    <button class="btn inscripcionDetalleBtn inscripcionDetalleBtnPrimario" type="button" data-inscripcion-accion="aprobar" data-inscripcion-id="${escapeHtml(inscripcion?._id || '')}">
                        <i class="fa-solid fa-circle-check" aria-hidden="true"></i>
                        Aprobar
                    </button>
                </div>
            </article>
        `;
    };

    const agruparInscripcionesPorEvento = (inscripciones) => {
        const grupos = new Map();

        inscripciones.forEach((inscripcion) => {
            const eventoId = extraerEventoIdInscripcion(inscripcion) || '__sin_evento__';
            const eventoDetalle = inscripcionesPendientesState.eventosById.get(eventoId) || null;

            if (!grupos.has(eventoId)) {
                grupos.set(eventoId, {
                    eventoId,
                    eventoDetalle,
                    inscripciones: [],
                });
            }

            grupos.get(eventoId).inscripciones.push(inscripcion);
        });

        return Array.from(grupos.values());
    };

    const renderInscripcionesPendientes = () => {
        const container = document.getElementById('cardsInscripcionesPendientesEditor');
        const conteo = document.getElementById('inscripcionesPendientesConteo');

        if (!container) {
            return;
        }

        if (inscripcionesPendientesState.inscripcionSeleccionadaId) {
            renderDetalleInscripcionSeleccionada();
            return;
        }

        if (!inscripcionesPendientesState.eventoSeleccionadoId) {
            renderSeleccionEventosInscripciones();
            return;
        }

        const listaBase = Array.isArray(inscripcionesPendientesState.inscripciones)
            ? [...inscripcionesPendientesState.inscripciones]
            : [];
        const terminoBusqueda = normalizarTexto(inscripcionesPendientesState.filtroTexto);
        const filtroSeleccionado = inscripcionesPendientesState.filtroSeleccionado || 'Nombre de Usuario';

        const listaEvento = listaBase.filter((inscripcion) => {
            return String(extraerEventoIdInscripcion(inscripcion)) === String(inscripcionesPendientesState.eventoSeleccionadoId);
        });

        const filtradas = !terminoBusqueda
            ? listaEvento
            : listaEvento.filter((inscripcion) => {
                const valorFiltro = normalizarTexto(getInscripcionFilterValue(inscripcion, filtroSeleccionado));
                return valorFiltro.includes(terminoBusqueda);
            });

        if (conteo) {
            if (terminoBusqueda) {
                conteo.textContent = `${filtradas.length} coincidencia(s) de ${listaBase.length} inscripciones pendientes`;
            } else {
                conteo.textContent = `${filtradas.length} inscripciones pendientes`;
            }
        }

        if (!filtradas.length) {
            container.innerHTML = '<p class="text-muted">No hay inscripciones pendientes para mostrar.</p>';
            return;
        }

        const grupos = agruparInscripcionesPorEvento(filtradas);

        container.innerHTML = grupos.map((grupo) => {
            const primeraInscripcion = grupo.inscripciones[0] || {};
            const nombreEvento = escapeHtml(obtenerNombreEventoInscripcion(primeraInscripcion, grupo.eventoDetalle));
            const fechaEvento = escapeHtml(formatearFechaEventoInscripcion(grupo.eventoDetalle));
            const organizador = escapeHtml(obtenerOrganizadorEventoInscripcion(grupo.eventoDetalle));

            const filasUsuarios = grupo.inscripciones.map((inscripcion) => {
                const inscripcionId = escapeHtml(inscripcion?._id || '');

                return `
                    <div class="inscripcionUsuarioRow" role="row">
                        <div class="inscripcionUsuarioInfo" role="cell">
                            <p class="inscripcionUsuarioNombre">${escapeHtml(inscripcion?.nombreCompleto || 'Nombre de Usuario')}</p>
                            <p class="inscripcionUsuarioMeta"><strong>Profesión u Oficio:</strong> ${escapeHtml(inscripcion?.profesion || 'No disponible')}</p>
                            <p class="inscripcionUsuarioMeta"><strong>Entidad a la que pertenece:</strong> ${escapeHtml(inscripcion?.entidadTrabajo || 'No disponible')}</p>
                            <p class="inscripcionUsuarioMeta"><strong>Tipo de deficiencia:</strong> ${escapeHtml(inscripcion?.tipoDeficiencia || 'No disponible')}</p>
                        </div>
                        <div class="inscripcionUsuarioAcciones" role="cell" aria-label="Acciones de inscripción">
                            <button class="btn inscripcionBtnDetalles" type="button" data-inscripcion-accion="ver" data-inscripcion-id="${inscripcionId}" data-evento-id="${escapeHtml(grupo.eventoId)}">Ver detalles</button>
                            <button class="btn inscripcionBtnDecision" type="button" aria-label="Rechazar inscripción" data-inscripcion-accion="rechazar-inscripcion" data-inscripcion-id="${inscripcionId}">
                                <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                            </button>
                            <button class="btn inscripcionBtnDecision" type="button" aria-label="Aceptar inscripción" data-inscripcion-accion="aprobar" data-inscripcion-id="${inscripcionId}">
                                <i class="fa-solid fa-check" aria-hidden="true"></i>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');

            return `
                <article class="inscripcionesEventoGrupo" aria-label="Inscripciones por evento">
                    <div class="inscripcionesEventoHeaderRow" role="row">
                        <p class="inscripcionesEventoTitulo"><strong>Evento:</strong> ${nombreEvento}.</p>
                        <p class="inscripcionesEventoMeta"><strong>Fecha del Evento:</strong> ${fechaEvento}</p>
                        <p class="inscripcionesEventoMeta"><strong>Organizador:</strong> ${organizador}</p>
                    </div>
                    ${filasUsuarios}
                </article>
            `;
        }).join('');
    };

    const cargarDetallesEventosInscripciones = async (inscripciones) => {
        const eventoIds = Array.from(new Set(
            inscripciones
                .map((inscripcion) => extraerEventoIdInscripcion(inscripcion))
                .filter(Boolean)
        ));

        const detalles = await Promise.all(eventoIds.map(async (eventoId) => {
            try {
                const response = await fetch(`/api/form-evento/${encodeURIComponent(eventoId)}`);

                if (!response.ok) {
                    return [eventoId, null];
                }

                const data = await response.json();
                return [eventoId, data?.evento || null];
            } catch (error) {
                console.error('No se pudo cargar el detalle del evento de inscripción:', error);
                return [eventoId, null];
            }
        }));

        inscripcionesPendientesState.eventosById = new Map(detalles);
    };

    const cargarEventosAprobacionInscripciones = async () => {
        const response = await fetch('/api/form-evento?estado=aprobado');

        if (!response.ok) {
            throw new Error('No se pudieron cargar los eventos aprobados.');
        }

        const data = await response.json();
        const eventos = Array.isArray(data?.eventos) ? data.eventos : [];
        inscripcionesPendientesState.eventosAprobados = eventos;

        eventos.forEach((evento) => {
            if (evento?._id) {
                inscripcionesPendientesState.eventosById.set(String(evento._id), evento);
            }
        });
    };

    const cargarInscripcionesPendientes = async () => {
        const container = document.getElementById('cardsInscripcionesPendientesEditor');

        if (!container) {
            return;
        }

        container.innerHTML = '<p class="text-muted">Cargando datos de inscripciones...</p>';

        try {
            const [eventosResponse, inscripcionesResponse] = await Promise.all([
                fetch('/api/form-evento?estado=aprobado'),
                fetch('/api/usuario-inscrito?estado=pendiente_aprobacion'),
            ]);

            if (!eventosResponse.ok || !inscripcionesResponse.ok) {
                throw new Error('No se pudieron cargar los datos de la sección.');
            }

            const eventosData = await eventosResponse.json();
            const inscripcionesData = await inscripcionesResponse.json();
            const eventos = Array.isArray(eventosData?.eventos) ? eventosData.eventos : [];
            const inscripciones = Array.isArray(inscripcionesData?.inscripciones) ? inscripcionesData.inscripciones : [];

            inscripcionesPendientesState.eventosAprobados = eventos;
            inscripcionesPendientesState.inscripciones = inscripciones;

            inscripcionesPendientesState.eventosById = new Map(
                eventos
                    .filter((evento) => evento?._id)
                    .map((evento) => [String(evento._id), evento])
            );

            await cargarDetallesEventosInscripciones(inscripciones);
            configurarUIAprobacionInscripciones();
            renderInscripcionesPendientes();
        } catch (error) {
            console.error('Error al cargar inscripciones pendientes:', error);
            container.innerHTML = '<div class="alert alert-warning mb-0">No se pudieron cargar las inscripciones pendientes.</div>';
        }
    };

    const actualizarEstadoInscripcionPendiente = async (inscripcionId, estado, motivoRechazo = '') => {
        const response = await fetch(`/api/usuario-inscrito/${encodeURIComponent(inscripcionId)}/estado`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ estado, motivoRechazo }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok || !data?.ok) {
            throw new Error(data?.mensaje || 'No se pudo actualizar la inscripción.');
        }

        inscripcionesPendientesState.inscripciones = inscripcionesPendientesState.inscripciones
            .filter((inscripcion) => String(inscripcion?._id) !== String(inscripcionId));

        if (String(inscripcionesPendientesState.inscripcionSeleccionadaId) === String(inscripcionId)) {
            inscripcionesPendientesState.inscripcionSeleccionadaId = '';
        }

        configurarUIAprobacionInscripciones();

        renderInscripcionesPendientes();
    };

    const initAprobacionInscripcionesEditor = async () => {
        const filtroSelect = document.getElementById('gestionInscripcionesFiltro');
        const busquedaInput = document.getElementById('gestionInscripcionesBusqueda');
        const searchButton = document.getElementById('gestionInscripcionesBuscarBtn');
        const cardsContainer = document.getElementById('cardsInscripcionesPendientesEditor');
        const breadcrumb = document.getElementById('breadcrumbAprobacionInscripciones');
        const rechazoModalElement = document.getElementById('modalRechazoInscripcion');
        const rechazoDescripcion = document.getElementById('modalRechazoInscripcionDescripcion');
        const rechazoMotivoInput = document.getElementById('modalRechazoInscripcionMotivo');
        const rechazoAceptarBtn = document.getElementById('modalRechazoInscripcionAceptarBtn');
        const confirmacionRechazoModalElement = document.getElementById('modalConfirmacionRechazoInscripcion');
        const confirmacionRechazoBtn = document.getElementById('modalConfirmacionRechazoInscripcionBtn');
        const aprobacionExitosaModalElement = document.getElementById('modalInscripcionAprobada');

        const rechazoModalInstance = rechazoModalElement && globalThis.bootstrap?.Modal
            ? globalThis.bootstrap.Modal.getOrCreateInstance(rechazoModalElement)
            : null;
        const confirmacionRechazoModalInstance = confirmacionRechazoModalElement && globalThis.bootstrap?.Modal
            ? globalThis.bootstrap.Modal.getOrCreateInstance(confirmacionRechazoModalElement)
            : null;
        const aprobacionExitosaModalInstance = aprobacionExitosaModalElement && globalThis.bootstrap?.Modal
            ? globalThis.bootstrap.Modal.getOrCreateInstance(aprobacionExitosaModalElement)
            : null;
        let abrirConfirmacionRechazo = false;

        if (!cardsContainer) {
            return;
        }

        if (rechazoAceptarBtn && rechazoAceptarBtn.dataset.inscripcionBound !== 'true') {
            rechazoAceptarBtn.addEventListener('click', () => {
                if (!inscripcionesPendientesState.inscripcionRechazoPendienteId) {
                    return;
                }

                if (!confirmacionRechazoModalInstance) {
                    const confirmar = globalThis.confirm('¿Rechazar esta inscripción?');

                    if (!confirmar) {
                        return;
                    }

                    const inscripcionId = inscripcionesPendientesState.inscripcionRechazoPendienteId;

                    if (!inscripcionId) {
                        return;
                    }

                    (async () => {
                        try {
                            await actualizarEstadoInscripcionPendiente(
                                inscripcionId,
                                'rechazado',
                                String(rechazoMotivoInput?.value || '').trim()
                            );
                        } catch (error) {
                            globalThis.alert(error.message || 'No se pudo rechazar la inscripción.');
                        }
                    })();

                    return;
                }

                abrirConfirmacionRechazo = true;
                rechazoModalInstance?.hide();
            });

            rechazoAceptarBtn.dataset.inscripcionBound = 'true';
        }

        if (rechazoModalElement && rechazoModalElement.dataset.inscripcionBound !== 'true') {
            rechazoModalElement.addEventListener('hidden.bs.modal', () => {
                if (abrirConfirmacionRechazo) {
                    abrirConfirmacionRechazo = false;
                    confirmacionRechazoModalInstance?.show();
                    return;
                }

                inscripcionesPendientesState.inscripcionRechazoPendienteId = '';

                if (rechazoMotivoInput) {
                    rechazoMotivoInput.value = '';
                }
            });

            rechazoModalElement.dataset.inscripcionBound = 'true';
        }

        if (confirmacionRechazoBtn && confirmacionRechazoBtn.dataset.inscripcionBound !== 'true') {
            confirmacionRechazoBtn.addEventListener('click', async () => {
                const inscripcionId = inscripcionesPendientesState.inscripcionRechazoPendienteId;

                if (!inscripcionId) {
                    return;
                }

                confirmacionRechazoBtn.disabled = true;

                try {
                    await actualizarEstadoInscripcionPendiente(
                        inscripcionId,
                        'rechazado',
                        String(rechazoMotivoInput?.value || '').trim()
                    );

                    inscripcionesPendientesState.inscripcionRechazoPendienteId = '';
                    if (rechazoMotivoInput) {
                        rechazoMotivoInput.value = '';
                    }

                    confirmacionRechazoModalInstance?.hide();
                } catch (error) {
                    globalThis.alert(error.message || 'No se pudo rechazar la inscripción.');
                } finally {
                    confirmacionRechazoBtn.disabled = false;
                }
            });

            confirmacionRechazoBtn.dataset.inscripcionBound = 'true';
        }

        if (confirmacionRechazoModalElement && confirmacionRechazoModalElement.dataset.inscripcionBound !== 'true') {
            confirmacionRechazoModalElement.addEventListener('hidden.bs.modal', () => {
                inscripcionesPendientesState.inscripcionRechazoPendienteId = '';
            });

            confirmacionRechazoModalElement.dataset.inscripcionBound = 'true';
        }

        if (filtroSelect) {
            filtroSelect.value = inscripcionesPendientesState.filtroSeleccionado;

            if (filtroSelect.dataset.inscripcionesBound !== 'true') {
                filtroSelect.addEventListener('change', () => {
                    inscripcionesPendientesState.filtroSeleccionado = filtroSelect.value || 'Nombre de Usuario';
                    renderInscripcionesPendientes();
                });

                filtroSelect.dataset.inscripcionesBound = 'true';
            }
        }

        if (busquedaInput) {
            busquedaInput.value = inscripcionesPendientesState.filtroTexto;

            if (busquedaInput.dataset.inscripcionesBound !== 'true') {
                busquedaInput.addEventListener('input', () => {
                    inscripcionesPendientesState.filtroTexto = busquedaInput.value || '';
                    renderInscripcionesPendientes();
                });

                busquedaInput.dataset.inscripcionesBound = 'true';
            }
        }

        if (searchButton && searchButton.dataset.inscripcionesBound !== 'true') {
            searchButton.addEventListener('click', () => {
                inscripcionesPendientesState.filtroTexto = busquedaInput?.value || '';
                renderInscripcionesPendientes();
            });

            searchButton.dataset.inscripcionesBound = 'true';
        }

        if (breadcrumb && breadcrumb.dataset.inscripcionesBound !== 'true') {
            breadcrumb.addEventListener('click', (event) => {
                const target = event.target.closest('[data-inscripcion-nav]');

                if (!target) {
                    return;
                }

                event.preventDefault();
                const destino = target.dataset.inscripcionNav;

                if (destino === 'inscripciones') {
                    inscripcionesPendientesState.inscripcionSeleccionadaId = '';
                    inscripcionesPendientesState.filtroTexto = '';
                    inscripcionesPendientesState.filtroSeleccionado = 'Nombre de Usuario';
                } else {
                    inscripcionesPendientesState.eventoSeleccionadoId = '';
                    inscripcionesPendientesState.inscripcionSeleccionadaId = '';
                    inscripcionesPendientesState.filtroTexto = '';
                    inscripcionesPendientesState.filtroSeleccionado = 'Título del Evento';
                }

                if (busquedaInput) {
                    busquedaInput.value = '';
                }

                configurarUIAprobacionInscripciones();
                renderInscripcionesPendientes();
            });

            breadcrumb.dataset.inscripcionesBound = 'true';
        }

        if (cardsContainer.dataset.inscripcionesActionsBound !== 'true') {
            cardsContainer.addEventListener('click', async (event) => {
                const actionButton = event.target.closest('[data-inscripcion-accion]');

                if (!actionButton) {
                    return;
                }

                const action = actionButton.dataset.inscripcionAccion;
                const inscripcionId = actionButton.dataset.inscripcionId;
                const eventoId = actionButton.dataset.eventoId;
                const inscripcionSeleccionada = inscripcionesPendientesState.inscripciones
                    .find((inscripcion) => String(inscripcion?._id) === String(inscripcionId));

                if (action === 'seleccionar-evento' && eventoId) {
                    inscripcionesPendientesState.eventoSeleccionadoId = eventoId;
                    inscripcionesPendientesState.inscripcionSeleccionadaId = '';
                    inscripcionesPendientesState.filtroTexto = '';
                    configurarUIAprobacionInscripciones();

                    const busqueda = document.getElementById('gestionInscripcionesBusqueda');
                    if (busqueda) {
                        busqueda.value = '';
                    }

                    renderInscripcionesPendientes();
                    return;
                }

                if (!inscripcionId || !inscripcionSeleccionada) {
                    return;
                }

                if (action === 'ver') {
                    inscripcionesPendientesState.inscripcionSeleccionadaId = inscripcionId;
                    configurarUIAprobacionInscripciones();
                    renderInscripcionesPendientes();
                    return;
                }

                if (action === 'aprobar') {
                    try {
                        await actualizarEstadoInscripcionPendiente(inscripcionId, 'aprobado');
                        if (aprobacionExitosaModalInstance) {
                            aprobacionExitosaModalInstance.show();
                        }
                    } catch (error) {
                        globalThis.alert(error.message || 'No se pudo aprobar la inscripción.');
                    }

                    return;
                }

                if (action === 'rechazar' || action === 'rechazar-inscripcion') {
                    inscripcionesPendientesState.inscripcionRechazoPendienteId = inscripcionId;

                    if (rechazoDescripcion) {
                        const nombre = inscripcionSeleccionada?.nombreCompleto || 'la persona inscrita';
                        rechazoDescripcion.textContent = `Para realizar el rechazo de la inscripción de ${nombre}, favor indicar el motivo por el cual fue rechazada en el recuadro siguiente. Este será enviado a la persona inscrita.`;
                    }

                    if (rechazoMotivoInput) {
                        rechazoMotivoInput.value = '';
                    }

                    if (rechazoModalInstance) {
                        rechazoModalInstance.show();
                        return;
                    }

                    const motivoFallback = globalThis.prompt('Indique el motivo del rechazo (opcional):', '');

                    if (motivoFallback === null) {
                        inscripcionesPendientesState.inscripcionRechazoPendienteId = '';
                        return;
                    }

                    try {
                        await actualizarEstadoInscripcionPendiente(inscripcionId, 'rechazado', String(motivoFallback || '').trim());
                        inscripcionesPendientesState.inscripcionRechazoPendienteId = '';
                    } catch (error) {
                        globalThis.alert(error.message || 'No se pudo rechazar la inscripción.');
                    }

                    return;
                }
            });

            cardsContainer.dataset.inscripcionesActionsBound = 'true';
        }

        inscripcionesPendientesState.eventoSeleccionadoId = '';
        inscripcionesPendientesState.inscripcionSeleccionadaId = '';
        inscripcionesPendientesState.filtroTexto = '';
        inscripcionesPendientesState.filtroSeleccionado = 'Título del Evento';
        configurarUIAprobacionInscripciones();

        await cargarInscripcionesPendientes();
    };

    const configurarUIInscritosEventos = () => {
        const titulo = document.getElementById('inscritosEventosTitulo');
        const buscadorTitulo = document.getElementById('inscritosEventosBuscadorTitulo');
        const filtroSelect = document.getElementById('gestionInscritosEventosFiltro');
        const breadcrumb = document.getElementById('breadcrumbInscritosEventos');
        const iconoWrap = document.getElementById('inscritosEventosIconoWrap');
        const buscadorWrap = document.getElementById('inscritosEventosBuscadorWrap');
        const filtroLabelWrap = document.getElementById('inscritosEventosFiltroLabelWrap');
        const filtroWrap = document.getElementById('inscritosEventosFiltroWrap');
        const conteoWrap = document.getElementById('inscritosEventosConteoWrap');

        const modoEvento = !inscritosEventosState.eventoSeleccionadoId;
        const modoDetalle = Boolean(inscritosEventosState.inscripcionSeleccionadaId);
        const inscripcionSeleccionada = inscritosEventosState.inscripcionesAprobadas
            .find((inscripcion) => String(inscripcion?._id) === String(inscritosEventosState.inscripcionSeleccionadaId));

        if (titulo) {
            if (modoEvento) {
                titulo.textContent = 'Seleccionar Evento';
            } else if (modoDetalle) {
                titulo.textContent = inscripcionSeleccionada?.nombreCompleto || 'Detalle de Inscrito';
            } else {
                titulo.textContent = 'Usuarios Inscritos';
            }
        }

        if (buscadorTitulo) {
            buscadorTitulo.textContent = modoEvento ? 'Buscador de Eventos' : 'Buscador de Usuarios';
        }

        const mostrarBuscador = !modoDetalle;
        if (buscadorWrap) buscadorWrap.classList.toggle('d-none', !mostrarBuscador);
        if (filtroLabelWrap) filtroLabelWrap.classList.toggle('d-none', !mostrarBuscador);
        if (filtroWrap) filtroWrap.classList.toggle('d-none', !mostrarBuscador);
        if (conteoWrap) conteoWrap.classList.toggle('d-none', !mostrarBuscador);

        if (breadcrumb) {
            breadcrumb.innerHTML = modoEvento
                ? `
                    <li class="breadcrumb-item"><a class="text-decoration-none" href="../modulo-editor.html">Inicio</a></li>
                    <li class="breadcrumb-item"><a class="text-decoration-none" href="#" data-inscritos-nav="usuarios">Usuarios</a></li>
                    <li class="breadcrumb-item active" aria-current="page">Inscritos a Eventos</li>
                `
                : modoDetalle
                    ? `
                        <li class="breadcrumb-item"><a class="text-decoration-none" href="../modulo-editor.html">Inicio</a></li>
                        <li class="breadcrumb-item"><a class="text-decoration-none" href="#" data-inscritos-nav="usuarios">Usuarios</a></li>
                        <li class="breadcrumb-item"><a class="text-decoration-none" href="#" data-inscritos-nav="inscritos">Inscritos a Eventos</a></li>
                        <li class="breadcrumb-item"><a class="text-decoration-none" href="#" data-inscritos-nav="usuarios-inscritos">Usuarios Inscritos</a></li>
                        <li class="breadcrumb-item active" aria-current="page">Detalle</li>
                    `
                    : `
                        <li class="breadcrumb-item"><a class="text-decoration-none" href="../modulo-editor.html">Inicio</a></li>
                        <li class="breadcrumb-item"><a class="text-decoration-none" href="#" data-inscritos-nav="usuarios">Usuarios</a></li>
                        <li class="breadcrumb-item"><a class="text-decoration-none" href="#" data-inscritos-nav="inscritos">Inscritos a Eventos</a></li>
                        <li class="breadcrumb-item active" aria-current="page">Usuarios Inscritos</li>
                    `;
        }

        if (iconoWrap) {
            iconoWrap.innerHTML = modoEvento
                ? '<i class="fa-regular fa-circle"></i>'
                : '<i class="fa-regular fa-user"></i>';
        }

        if (!filtroSelect || modoDetalle) {
            return;
        }

        const opciones = modoEvento
            ? ['Título del Evento', 'Organizador', 'Fecha del Evento']
            : ['Nombre de Usuario', 'Profesión', 'Tipo de deficiencia'];

        const opcionValida = opciones.includes(inscritosEventosState.filtroSeleccionado)
            ? inscritosEventosState.filtroSeleccionado
            : opciones[0];

        filtroSelect.innerHTML = opciones
            .map((opcion) => `<option value="${escapeHtml(opcion)}">${escapeHtml(opcion)}</option>`)
            .join('');

        filtroSelect.value = opcionValida;
        inscritosEventosState.filtroSeleccionado = opcionValida;
    };

    const renderSeleccionEventosInscritos = () => {
        const container = document.getElementById('cardsInscritosEventosEditor');
        const conteo = document.getElementById('inscritosEventosConteo');

        if (!container) {
            return;
        }

        const idsConInscritos = new Set(
            inscritosEventosState.inscripcionesAprobadas
                .map((inscripcion) => String(extraerEventoIdInscripcion(inscripcion) || ''))
                .filter(Boolean)
        );

        const listaBase = (Array.isArray(inscritosEventosState.eventosAprobados) ? inscritosEventosState.eventosAprobados : [])
            .filter((evento) => idsConInscritos.has(String(evento?._id || '')));

        const terminoBusqueda = normalizarTexto(inscritosEventosState.filtroTexto);
        const filtroSeleccionado = inscritosEventosState.filtroSeleccionado || 'Título del Evento';

        const eventosFiltrados = !terminoBusqueda
            ? listaBase
            : listaBase.filter((evento) => {
                const valorFiltro = normalizarTexto(getEventoAprobadoFilterValue(evento, filtroSeleccionado));
                return valorFiltro.includes(terminoBusqueda);
            });

        if (conteo) {
            if (terminoBusqueda) {
                conteo.textContent = `${eventosFiltrados.length} coincidencia(s) de ${listaBase.length} eventos con usuarios inscritos`;
            } else {
                conteo.textContent = `${eventosFiltrados.length} eventos con usuarios inscritos`;
            }
        }

        if (!eventosFiltrados.length) {
            container.innerHTML = '<p class="text-muted">No hay eventos con usuarios inscritos aprobados.</p>';
            return;
        }

        container.innerHTML = `
            <div class="row g-4">
                ${eventosFiltrados.map((evento) => {
                    const eventoId = escapeHtml(evento?._id || '');
                    const nombreEvento = escapeHtml(evento?.nombreEvento || 'Evento sin título');
                    const fechaEvento = escapeHtml(formatearFechaEventoInscripcion(evento));
                    const organizador = escapeHtml(obtenerOrganizadorEventoInscripcion(evento));

                    return `
                        <div class="col-12 col-md-6">
                            <article class="selectorEventoCard" aria-label="Evento con inscritos aprobados">
                                <div class="selectorEventoCardBody">
                                    <p class="selectorEventoCardTitulo">${nombreEvento}</p>
                                    <p class="selectorEventoCardMeta"><strong>Fecha del Evento:</strong> ${fechaEvento}</p>
                                    <p class="selectorEventoCardMeta"><strong>Organizador:</strong> ${organizador}</p>
                                </div>
                                <button class="btn selectorEventoCardArrow" type="button" aria-label="Ver inscritos del evento" data-inscritos-accion="seleccionar-evento" data-evento-id="${eventoId}">
                                    <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
                                </button>
                            </article>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    };

    const renderDetalleInscritoSeleccionado = () => {
        const container = document.getElementById('cardsInscritosEventosEditor');

        if (!container) {
            return;
        }

        const inscripcion = inscritosEventosState.inscripcionesAprobadas
            .find((item) => String(item?._id) === String(inscritosEventosState.inscripcionSeleccionadaId));

        if (!inscripcion) {
            inscritosEventosState.inscripcionSeleccionadaId = '';
            renderInscritosEventos();
            return;
        }

        const rows = [
            ['Correo Electrónico', inscripcion?.correoElectronico || 'No disponible'],
            ['Profesión u Oficio', inscripcion?.profesion || 'No disponible'],
            ['Entidad para la que trabaja o está vinculado', inscripcion?.entidadTrabajo || 'No disponible'],
            ['Tipo de Deficiencia', inscripcion?.tipoDeficiencia || 'No disponible'],
            ['Requiere Intérprete LESCO', formatearBooleanoInscripcion(inscripcion?.requiereInterprete)],
            ['Alimentación', inscripcion?.requerimientosAlimentacion || 'No disponible'],
        ];

        container.innerHTML = `
            <article class="inscripcionDetalleVista" aria-label="Detalle de usuario inscrito">
                <div class="inscripcionDetalleTablaWrap">
                    <table class="inscripcionDetalleTabla" aria-label="Información del usuario inscrito aprobado">
                        <tbody>
                            ${rows.map(([label, value]) => `
                                <tr>
                                    <th scope="row">${escapeHtml(label)}:</th>
                                    <td>${escapeHtml(value)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </article>
        `;
    };

    const renderInscritosEventos = () => {
        const container = document.getElementById('cardsInscritosEventosEditor');
        const conteo = document.getElementById('inscritosEventosConteo');

        if (!container) {
            return;
        }

        if (inscritosEventosState.inscripcionSeleccionadaId) {
            renderDetalleInscritoSeleccionado();
            return;
        }

        if (!inscritosEventosState.eventoSeleccionadoId) {
            renderSeleccionEventosInscritos();
            return;
        }

        const listaBase = Array.isArray(inscritosEventosState.inscripcionesAprobadas)
            ? [...inscritosEventosState.inscripcionesAprobadas]
            : [];
        const terminoBusqueda = normalizarTexto(inscritosEventosState.filtroTexto);
        const filtroSeleccionado = inscritosEventosState.filtroSeleccionado || 'Nombre de Usuario';

        const listaEvento = listaBase.filter((inscripcion) => {
            return String(extraerEventoIdInscripcion(inscripcion)) === String(inscritosEventosState.eventoSeleccionadoId);
        });

        const filtradas = !terminoBusqueda
            ? listaEvento
            : listaEvento.filter((inscripcion) => {
                const valorFiltro = normalizarTexto(getInscripcionFilterValue(inscripcion, filtroSeleccionado));
                return valorFiltro.includes(terminoBusqueda);
            });

        if (conteo) {
            if (terminoBusqueda) {
                conteo.textContent = `${filtradas.length} coincidencia(s) de ${listaEvento.length} usuarios inscritos`;
            } else {
                conteo.textContent = `${filtradas.length} usuarios inscritos`;
            }
        }

        if (!filtradas.length) {
            container.innerHTML = '<p class="text-muted">No hay usuarios inscritos aprobados para mostrar.</p>';
            return;
        }

        const eventoDetalle = inscritosEventosState.eventosById.get(String(inscritosEventosState.eventoSeleccionadoId)) || null;
        const primeraInscripcion = filtradas[0] || {};
        const nombreEvento = escapeHtml(obtenerNombreEventoInscripcion(primeraInscripcion, eventoDetalle));
        const fechaEvento = escapeHtml(formatearFechaEventoInscripcion(eventoDetalle));
        const organizador = escapeHtml(obtenerOrganizadorEventoInscripcion(eventoDetalle));

        const filasUsuarios = filtradas.map((inscripcion) => {
            const inscripcionId = escapeHtml(inscripcion?._id || '');

            return `
                <div class="inscripcionUsuarioRow" role="row">
                    <div class="inscripcionUsuarioInfo" role="cell">
                        <p class="inscripcionUsuarioNombre">${escapeHtml(inscripcion?.nombreCompleto || 'Nombre de Usuario')}</p>
                        <p class="inscripcionUsuarioMeta"><strong>Profesión u Oficio:</strong> ${escapeHtml(inscripcion?.profesion || 'No disponible')}</p>
                        <p class="inscripcionUsuarioMeta"><strong>Entidad a la que pertenece:</strong> ${escapeHtml(inscripcion?.entidadTrabajo || 'No disponible')}</p>
                        <p class="inscripcionUsuarioMeta"><strong>Tipo de deficiencia:</strong> ${escapeHtml(inscripcion?.tipoDeficiencia || 'No disponible')}</p>
                    </div>
                    <div class="inscripcionUsuarioAcciones" role="cell" aria-label="Acciones del usuario inscrito">
                        <button class="btn inscripcionBtnDetalles" type="button" data-inscritos-accion="ver" data-inscripcion-id="${inscripcionId}">Ver detalles</button>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <article class="inscripcionesEventoGrupo" aria-label="Usuarios inscritos por evento">
                <div class="inscripcionesEventoHeaderRow" role="row">
                    <p class="inscripcionesEventoTitulo"><strong>Evento:</strong> ${nombreEvento}.</p>
                    <p class="inscripcionesEventoMeta"><strong>Fecha del Evento:</strong> ${fechaEvento}</p>
                    <p class="inscripcionesEventoMeta"><strong>Organizador:</strong> ${organizador}</p>
                </div>
                ${filasUsuarios}
            </article>
        `;
    };

    const cargarInscritosEventos = async () => {
        const container = document.getElementById('cardsInscritosEventosEditor');

        if (!container) {
            return;
        }

        container.innerHTML = '<p class="text-muted">Cargando usuarios inscritos...</p>';

        try {
            const [eventosResponse, inscripcionesResponse] = await Promise.all([
                fetch('/api/form-evento?estado=aprobado'),
                fetch('/api/usuario-inscrito?estado=aprobado'),
            ]);

            if (!eventosResponse.ok || !inscripcionesResponse.ok) {
                throw new Error('No se pudieron cargar los datos de la sección.');
            }

            const eventosData = await eventosResponse.json();
            const inscripcionesData = await inscripcionesResponse.json();
            const eventos = Array.isArray(eventosData?.eventos) ? eventosData.eventos : [];
            const inscripciones = Array.isArray(inscripcionesData?.inscripciones) ? inscripcionesData.inscripciones : [];

            inscritosEventosState.eventosAprobados = eventos;
            inscritosEventosState.inscripcionesAprobadas = inscripciones;
            inscritosEventosState.eventosById = new Map(
                eventos
                    .filter((evento) => evento?._id)
                    .map((evento) => [String(evento._id), evento])
            );

            await cargarDetallesEventosInscripciones(inscripciones);

            for (const [eventoId, evento] of inscripcionesPendientesState.eventosById.entries()) {
                if (!inscritosEventosState.eventosById.has(eventoId) && evento) {
                    inscritosEventosState.eventosById.set(eventoId, evento);
                }
            }

            configurarUIInscritosEventos();
            renderInscritosEventos();
        } catch (error) {
            console.error('Error al cargar inscritos a eventos:', error);
            container.innerHTML = '<div class="alert alert-warning mb-0">No se pudieron cargar los usuarios inscritos.</div>';
        }
    };

    const initInscritosEventosEditor = async () => {
        const filtroSelect = document.getElementById('gestionInscritosEventosFiltro');
        const busquedaInput = document.getElementById('gestionInscritosEventosBusqueda');
        const searchButton = document.getElementById('gestionInscritosEventosBuscarBtn');
        const cardsContainer = document.getElementById('cardsInscritosEventosEditor');
        const breadcrumb = document.getElementById('breadcrumbInscritosEventos');

        if (!cardsContainer) {
            return;
        }

        if (filtroSelect) {
            filtroSelect.value = inscritosEventosState.filtroSeleccionado;

            if (filtroSelect.dataset.inscritosBound !== 'true') {
                filtroSelect.addEventListener('change', () => {
                    inscritosEventosState.filtroSeleccionado = filtroSelect.value || 'Nombre de Usuario';
                    renderInscritosEventos();
                });

                filtroSelect.dataset.inscritosBound = 'true';
            }
        }

        if (busquedaInput) {
            busquedaInput.value = inscritosEventosState.filtroTexto;

            if (busquedaInput.dataset.inscritosBound !== 'true') {
                busquedaInput.addEventListener('input', () => {
                    inscritosEventosState.filtroTexto = busquedaInput.value || '';
                    renderInscritosEventos();
                });

                busquedaInput.dataset.inscritosBound = 'true';
            }
        }

        if (searchButton && searchButton.dataset.inscritosBound !== 'true') {
            searchButton.addEventListener('click', () => {
                inscritosEventosState.filtroTexto = busquedaInput?.value || '';
                renderInscritosEventos();
            });

            searchButton.dataset.inscritosBound = 'true';
        }

        if (breadcrumb && breadcrumb.dataset.inscritosBound !== 'true') {
            breadcrumb.addEventListener('click', (event) => {
                const target = event.target.closest('[data-inscritos-nav]');

                if (!target) {
                    return;
                }

                event.preventDefault();
                const destino = target.dataset.inscritosNav;

                if (destino === 'usuarios-inscritos') {
                    inscritosEventosState.inscripcionSeleccionadaId = '';
                    inscritosEventosState.filtroTexto = '';
                    inscritosEventosState.filtroSeleccionado = 'Nombre de Usuario';
                } else {
                    inscritosEventosState.eventoSeleccionadoId = '';
                    inscritosEventosState.inscripcionSeleccionadaId = '';
                    inscritosEventosState.filtroTexto = '';
                    inscritosEventosState.filtroSeleccionado = 'Título del Evento';
                }

                if (busquedaInput) {
                    busquedaInput.value = '';
                }

                configurarUIInscritosEventos();
                renderInscritosEventos();
            });

            breadcrumb.dataset.inscritosBound = 'true';
        }

        if (cardsContainer.dataset.inscritosActionsBound !== 'true') {
            cardsContainer.addEventListener('click', (event) => {
                const actionButton = event.target.closest('[data-inscritos-accion]');

                if (!actionButton) {
                    return;
                }

                const action = actionButton.dataset.inscritosAccion;
                const inscripcionId = actionButton.dataset.inscripcionId;
                const eventoId = actionButton.dataset.eventoId;

                if (action === 'seleccionar-evento' && eventoId) {
                    inscritosEventosState.eventoSeleccionadoId = eventoId;
                    inscritosEventosState.inscripcionSeleccionadaId = '';
                    inscritosEventosState.filtroTexto = '';
                    inscritosEventosState.filtroSeleccionado = 'Nombre de Usuario';
                    configurarUIInscritosEventos();

                    const busqueda = document.getElementById('gestionInscritosEventosBusqueda');
                    if (busqueda) {
                        busqueda.value = '';
                    }

                    renderInscritosEventos();
                    return;
                }

                if (action === 'ver' && inscripcionId) {
                    inscritosEventosState.inscripcionSeleccionadaId = inscripcionId;
                    configurarUIInscritosEventos();
                    renderInscritosEventos();
                }
            });

            cardsContainer.dataset.inscritosActionsBound = 'true';
        }

        inscritosEventosState.eventoSeleccionadoId = '';
        inscritosEventosState.inscripcionSeleccionadaId = '';
        inscritosEventosState.filtroTexto = '';
        inscritosEventosState.filtroSeleccionado = 'Título del Evento';
        configurarUIInscritosEventos();

        await cargarInscritosEventos();
    };

    const getSidebarKey = (link) => link.dataset.sidebarKey || link.textContent.trim();
    const getDraftManager = () => globalThis.crearEventoDraftManager;

    const updateDraftState = () => {
        if (activeSidebarKey !== 'crear-evento') {
            hasDraftChanges = false;
            return;
        }

        const draftManager = getDraftManager();
        hasDraftChanges = Boolean(draftManager?.hasTypedData?.());
    };

    const clearCrearEventoDraft = async () => {
        const draftManager = getDraftManager();
        await draftManager?.clearDraft?.();
    };

    const navigateAfterDraftDecision = async (shouldDeleteDraft = false) => {
        if (shouldDeleteDraft) {
            await clearCrearEventoDraft();
        } else {
            const draftManager = getDraftManager();
            await draftManager?.saveDraft?.();
            draftManager?.resetDraftKey?.();
            draftManager?.clearLocalDraft?.();
            draftManager?.clearFormData?.();
        }

        hasDraftChanges = false;

        const linkToNavigate = pendingNavigationLink;
        pendingNavigationLink = null;

        if (linkToNavigate) {
            setActiveLink(linkToNavigate);
        }
    };

    const ensureDeleteConfirmModal = () => {
        const modalElement = document.getElementById('modalEliminarEvento');
        if (!modalElement || !globalThis.bootstrap?.Modal) {
            return false;
        }

        const deleteButton = modalElement.querySelector('.modalEliminarEventoBtnEliminar');

        if (modalElement.dataset.draftDeleteBound !== 'true') {
            deleteButton?.addEventListener('click', () => {
                deleteConfirmed = true;
                deleteEventModalInstance?.hide();
            });

            modalElement.addEventListener('hidden.bs.modal', () => {
                if (deleteConfirmed) {
                    deleteConfirmed = false;

                    if (pendingNavigationLink) {
                        navigateAfterDraftDecision(true);
                    }

                    return;
                }

                if (pendingNavigationLink && leaveDraftModalInstance) {
                    leaveDraftModalInstance.show();
                }
            });

            modalElement.dataset.draftDeleteBound = 'true';
        }

        deleteEventModalInstance = globalThis.bootstrap.Modal.getOrCreateInstance(modalElement);
        return Boolean(deleteEventModalInstance);
    };

    const openDeleteConfirmationModal = () => {
        const hasDeleteModal = ensureDeleteConfirmModal();
        if (!hasDeleteModal) {
            navigateAfterDraftDecision();
            return;
        }

        const draftModalElement = document.getElementById('modalEventoBorrador');
        if (!draftModalElement || !leaveDraftModalInstance) {
            deleteEventModalInstance?.show();
            return;
        }

        openingDeleteConfirmation = true;

        const onDraftModalHidden = () => {
            draftModalElement.removeEventListener('hidden.bs.modal', onDraftModalHidden);
            openingDeleteConfirmation = false;
            deleteEventModalInstance?.show();
        };

        draftModalElement.addEventListener('hidden.bs.modal', onDraftModalHidden);
        leaveDraftModalInstance.hide();
    };

    const ensureLeaveDraftModal = () => {
        const modalElement = document.getElementById('modalEventoBorrador');
        if (!modalElement || !globalThis.bootstrap?.Modal) {
            return false;
        }

        const keepDraftButton = modalElement.querySelector('.modalEventoBorradorBtnContinuar');
        const deleteEventButton = modalElement.querySelector('.modalEventoBorradorBtnEliminar');

        if (modalElement.dataset.draftGuardBound !== 'true') {
            keepDraftButton?.addEventListener('click', async () => {
                await navigateAfterDraftDecision(false);
            });

            deleteEventButton?.addEventListener('click', () => {
                openDeleteConfirmationModal();
            });

            modalElement.addEventListener('hidden.bs.modal', () => {
                if (!openingDeleteConfirmation) {
                    pendingNavigationLink = null;
                }
            });

            modalElement.dataset.draftGuardBound = 'true';
        }

        leaveDraftModalInstance = globalThis.bootstrap.Modal.getOrCreateInstance(modalElement);
        return Boolean(leaveDraftModalInstance);
    };

    const promptDraftDecision = (targetLink) => {
        pendingNavigationLink = targetLink;
        const hasModal = ensureLeaveDraftModal();

        if (hasModal && leaveDraftModalInstance) {
            leaveDraftModalInstance.show();
            return;
        }

        navigateAfterDraftDecision(false);
    };

    const defaultPanelHtml = `
        <p class="gestionEditorPanelText">Selecciona una opcion del menu para ver el contenido.</p>
    `;

    const renderSection = (sidebarKey) => {
        if (!contentPanel) {
            return;
        }

        const section = sectionTemplates[sidebarKey];

        if (!section) {
            contentPanel.innerHTML = defaultPanelHtml;
            return;
        }

        contentPanel.innerHTML = section.html;

        if (sidebarKey === 'crear-evento' && typeof globalThis.initCrearEvento === 'function') {
            globalThis.initCrearEvento();
            const draftManager = getDraftManager();
            const hasPreload = Boolean(sessionStorage.getItem('gestionEditor.crearEventoPreload'));

            draftManager?.resetDraftKey?.();
            draftManager?.clearLocalDraft?.();

            if (hasPreload) {
                globalThis.applyPendingCrearEventoPreload?.();
            } else {
                draftManager?.clearEditContext?.();
                draftManager?.clearFormData?.();
            }

            updateDraftState();
        }

        if (sidebarKey === 'eventos-borrador' && typeof globalThis.initEventoBorrador === 'function') {
            globalThis.initEventoBorrador();
        }

        if (sidebarKey === 'suscriptores' && typeof initSuscriptoresEditor === 'function') {
            initSuscriptoresEditor();
        }

        if (sidebarKey === 'consultas' && typeof globalThis.initConsultasEditor === 'function') {
            globalThis.initConsultasEditor();
        }

        if (sidebarKey === 'eventos-finalizados' && typeof initEventosFinalizadosEditor === 'function') {
            initEventosFinalizadosEditor();
        }

        if (sidebarKey === 'aprobacion-inscripciones' && typeof initAprobacionInscripcionesEditor === 'function') {
            initAprobacionInscripcionesEditor();
        }

        if (sidebarKey === 'inscritos-eventos' && typeof initInscritosEventosEditor === 'function') {
            initInscritosEventosEditor();
        }

        if (sidebarKey === 'listas-difusion' && typeof globalThis.initListaDifusionEdit === 'function') {
            globalThis.initListaDifusionEdit();
        }

        if (sidebarKey === 'eventos-publicados' && typeof globalThis.initEventosPublicadosEditor === 'function') {
            globalThis.initEventosPublicadosEditor();
        }
    };

    const setActiveLink = (activeLink) => {
        sidebarLinks.forEach((link) => {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
        });

        if (activeLink) {
            const activeKeyValue = getSidebarKey(activeLink);
            const activeLabel = activeLink.textContent.trim();

            sidebarLinks.forEach((link) => {
                if (getSidebarKey(link) === activeKeyValue) {
                    link.classList.add('active');
                    link.setAttribute('aria-current', 'page');
                }
            });

            if (mobileMenuLabel) {
                mobileMenuLabel.textContent = activeLabel;
            }

            activeSidebarKey = activeKeyValue;
            renderSection(activeKeyValue);
            return;
        }

        if (mobileMenuLabel) {
            mobileMenuLabel.textContent = 'Opciones de gestión';
        }

        activeSidebarKey = null;
        renderSection(null);
    };

    setActiveLink(null);

    const validateListaDifusionRequiredFields = (form) => {
        const nombreInput = form.querySelector('#nombreLista');
        const descripcionInput = form.querySelector('#descripcionLista');

        if (!nombreInput || !descripcionInput) {
            return true;
        }

        const nombreValido = nombreInput.value.trim().length > 0;
        const descripcionValida = descripcionInput.value.trim().length > 0;

        nombreInput.classList.toggle('is-invalid', !nombreValido);
        descripcionInput.classList.toggle('is-invalid', !descripcionValida);

        return nombreValido && descripcionValida;
    };

    const mostrarModalListaEnviada = () => {
        const modalElement = document.getElementById('modalListaEnviada');

        if (!modalElement || !globalThis.bootstrap?.Modal) {
            return false;
        }

        globalThis.bootstrap.Modal.getOrCreateInstance(modalElement).show();
        return true;
    };

    contentPanel?.addEventListener('submit', async (event) => {
        if (activeSidebarKey !== 'crear-lista-difusion') {
            return;
        }

        const submittedForm = event.target;

        if (!(submittedForm instanceof HTMLFormElement) || submittedForm.id !== 'formCrearListaDifusion') {
            return;
        }

        event.preventDefault();

        const formIsValid = validateListaDifusionRequiredFields(submittedForm);

        if (!formIsValid) {
            return;
        }

        const nombreInput = submittedForm.querySelector('#nombreLista');
        const descripcionInput = submittedForm.querySelector('#descripcionLista');
        const submitButton = submittedForm.querySelector('button[type="submit"]');

        if (!(nombreInput instanceof HTMLInputElement)
            || !(descripcionInput instanceof HTMLTextAreaElement)
            || !(submitButton instanceof HTMLButtonElement)) {
            return;
        }

        const payload = {
            nombreLista: nombreInput.value.trim(),
            descripcionLista: descripcionInput.value.trim(),
            autorCorreo: 'editorEventos@conapdis.com',
            estado: 'pendiente_aprobacion',
        };

        submitButton.disabled = true;

        try {
            const response = await fetch('/api/lista-difusion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok || !data?.ok) {
                throw new Error(data?.mensaje || 'No fue posible guardar la lista de difusión.');
            }

            submittedForm.reset();
            nombreInput.classList.remove('is-invalid');
            descripcionInput.classList.remove('is-invalid');

            const modalShown = mostrarModalListaEnviada();
            if (!modalShown) {
                globalThis.alert('Lista enviada con éxito.');
            }
        } catch (error) {
            globalThis.alert(error.message || 'Ocurrió un error al guardar la lista de difusión.');
        } finally {
            submitButton.disabled = false;
        }
    });

    contentPanel?.addEventListener('input', (event) => {
        if (activeSidebarKey !== 'crear-evento') {
            return;
        }

        if (event.target.closest('.ceCard')) {
            updateDraftState();
        }
    });

    contentPanel?.addEventListener('change', (event) => {
        if (activeSidebarKey !== 'crear-evento') {
            return;
        }

        if (event.target.closest('.ceCard')) {
            updateDraftState();
        }
    });

    contentPanel?.addEventListener('input', (event) => {
        if (activeSidebarKey !== 'crear-lista-difusion') {
            return;
        }

        const target = event.target;

        if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) {
            return;
        }

        if (target.id === 'nombreLista' || target.id === 'descripcionLista') {
            target.classList.remove('is-invalid');
        }
    });

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden' && activeSidebarKey === 'crear-evento') {
            const draftManager = getDraftManager();
            const hasTypedData = Boolean(draftManager?.hasTypedData?.());

            if (!hasDraftChanges && !hasTypedData) {
                return;
            }

            draftManager?.saveDraft?.({ background: true });
            updateDraftState();
        }
    });

    globalThis.onbeforeunload = () => {
        if (activeSidebarKey !== 'crear-evento' || !hasDraftChanges) {
            return undefined;
        }

        const draftManager = getDraftManager();
        draftManager?.saveDraft?.({ background: true });
        return '';
    };

    sidebarLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
            const href = link.getAttribute('href');
            const targetSidebarKey = getSidebarKey(link);

            if (href === '#') {
                event.preventDefault();
            }

            if (activeSidebarKey === 'crear-evento' && targetSidebarKey !== 'crear-evento' && hasDraftChanges) {
                promptDraftDecision(link);
                return;
            }

            setActiveLink(link);
        });
    });
});