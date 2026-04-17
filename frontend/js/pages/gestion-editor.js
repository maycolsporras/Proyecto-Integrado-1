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
                            <span class="ceStepCircle">1</span>
                            <span class="ceStepDot ceStepDotActive" id="stepDot1" aria-hidden="true"></span>
                        </button>
                        <div class="ceStepLine"></div>
                        <button type="button" class="ceStep" id="stepIndicator2" aria-label="Ir al paso 2">
                            <span class="ceStepCircle">2</span>
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
                            <button type="button" class="ceIconBtn" aria-label="Vista previa del evento">
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
                
                
            `,
        },
        'eventos-borrador': {
            title: 'Eventos en Borrador',
            html: `
                
            
            `,
        },
        'crear-lista-difusion': {
            title: 'Crear lista de difusión',
            html: `
                
            
            `,
        },
        'listas-difusion': {
            title: 'Listas de Difusion',
            html: `
                
            
            `,
        },
        'suscriptores': {
            title: 'Suscriptores',
            html: `
                
            `,
        },
        'consultas': {
            title: 'Consultas',
            html: `
                
            
            `,
        },
        'aprobacion-inscripciones': {
            title: 'Aprobación de Inscripciones',
            html: `
            
            `,
        },
        'inscritos-eventos': {
            title: 'Inscritos a eventos',
            html: `
            
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

    const clearCrearEventoDraft = () => {
        const draftManager = getDraftManager();
        draftManager?.clearDraft?.();
    };

    const restoreCrearEventoDraft = () => {
        const draftManager = getDraftManager();
        draftManager?.restoreDraft?.();
    };

    const navigateAfterDraftDecision = () => {
        // Al continuar o eliminar, el flujo deja el formulario local en limpio.
        clearCrearEventoDraft();

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
                    navigateAfterDraftDecision();
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
            keepDraftButton?.addEventListener('click', () => {
                navigateAfterDraftDecision();
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

        navigateAfterDraftDecision();
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
            restoreCrearEventoDraft();
            updateDraftState();
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

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden' && activeSidebarKey === 'crear-evento') {
            const draftManager = getDraftManager();
            draftManager?.discardForm?.();
            hasDraftChanges = false;
        }
    });

    globalThis.addEventListener('beforeunload', () => {
        if (activeSidebarKey !== 'crear-evento') {
            return;
        }

        const draftManager = getDraftManager();
        draftManager?.clearDraft?.();
    });

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