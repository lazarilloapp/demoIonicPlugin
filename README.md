
# Requerimientos
- Ionic CLI


# Instalación
Para la instalación antes de ejecutar npm i, es necesario configurar el token de npm para tener acceso al repositorio privado.

## Opción 1
En la consola ejecutar el siguiente comando reemplazando `<token>` por el token proporcionado por Lazarillo.

```{bash}
export NPM_TOKEN=<token>
```

## Opción 2
Reemplazar el token en el archivo `.npmrc`. 

> Importante: Tener cuidado de no hacer commit con el token!

# Ejecución
```
cd demoIonicPlugin
npm install
ionic build
ionic capacitor run <platform> (android, ios)
```

# Para usar sdk en otros proyecto

Tener en cuenta las siguientes consideraciones:

## Android
En el `build.gradle`es necesario tener agregados los siguientes repositorios:

```
allprojects {
    repositories {
        mavenCentral()
        jcenter()
        maven { url "https://jitpack.io" }
        google()
    }
}
```


## DOC SDK
Puedes leer la documentación de los métodos disponibles en:
`node_modules/@lzdevelopers/lz-ionic-plugin/README.md`


