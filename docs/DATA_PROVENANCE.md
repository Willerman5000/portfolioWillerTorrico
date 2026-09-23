# Procedencia de datos - v1.0

## CV

Se utilizaron los CV proporcionados en el archivo `CV Willer Torrico.rar` para reconstruir formación, experiencia y herramientas. Se priorizó el CV detallado en español cuando había diferencias entre versiones.

No se publican datos sensibles o innecesarios como:

- Documento de identidad.
- Domicilio exacto.
- Fecha de nacimiento.
- Estado civil.
- Teléfonos personales.

## Investigación agrícola

El Data Lab usa valores documentados en los resúmenes INIAF adjuntos:

- Tomate: cuatro líneas de acción-investigación, 116 F1, 39 variedades introducidas, 6 híbridos introducidos en 2013 y 15 líneas puras de Taiwán.
- Cebolla: tabla de rendimientos esperados, ciclos y características varietales usada en el gráfico interactivo.
- Ajo: 9 ensayos de investigación documentados. La narrativa reporta 17 variedades/ecotipos mientras la tabla visible enumera 16. El portfolio conserva esta diferencia como un ejemplo de validación de calidad del dato.

## Tesis

El archivo de maestría contiene materiales académicos y de cursos, pero no se identificó en el contenido extraído un documento final de tesis ni un conjunto completo de mapas finales de tesis. Por ello, el sitio no atribuye resultados específicos a la tesis en v1.0.

La sección SIG queda preparada para recibir:

- GeoJSON.
- SHP convertido a GeoJSON.
- Raster publicados como tiles.
- Indicadores y gráficos de tesis.

## v1.1 · Tesis de Maestría (2019)

Fuente principal incorporada: **“Evaluación de la infiltrabilidad del suelo, como criterio de diseño y manejo de sistemas de riego por aspersión en el municipio de Cliza”**, Universidad Mayor de San Simón / Centro AGUA, 2019, autor Willer Gianni Torrico Arispe.

Datos publicados en el módulo interactivo:
- 7 unidades de suelo validadas.
- 22 parcelas de muestreo.
- 3 clases de infiltrabilidad: lenta, moderadamente lenta y moderada.
- Distribución reportada: 16,3%, 62,4% y 21,0% (99,7% por redondeo de la fuente).
- Rangos de infiltración básica: 2,91–4,46; 8,12–13,61; 15,5–24,8 mm/h.
- Tiempos máximos de riego comparativos: 13 h 44 min; 4 h 55 min; 2 h 34 min.
- Densidad aparente observada: 1,23–1,59 g/cm³.
- Metodología representada: doble anillo, curvas de infiltración, modelo de Kostiakov, coeficiente de determinación r² y simulación de disposición con WinSiPP2 12.6.

Los mapas incluidos en `frontend/assets/thesis/` fueron extraídos de la tesis aportada por el autor y se presentan como evidencia de trabajo cartográfico/SIG. No se inventaron capas ni resultados externos.
