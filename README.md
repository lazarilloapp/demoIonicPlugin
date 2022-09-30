# Demo app for Lazaarillo maps on a Capacitor plugin

## Requerimientos
- Ionic CLI


## Instalación

Para la instalación antes de ejecutar `npm i --legacy-peer-deps`, es necesario configurar el token de npm para tener acceso al repositorio privado.

### Opción 1
En la consola ejecutar el siguiente comando reemplazando `<token>` por el token proporcionado por Lazarillo.

```{bash}
export NPM_TOKEN=<token>
```

### Opción 2
Reemplazar el token en el archivo `.npmrc`. 

> Importante: Tener cuidado de no hacer commit con el token!

Now we can run this commands to install the dependencies:
`npm install @lzdevelopers/lazarillo-maps --legacy-peer-deps`
`npm install`



## Ejecución
> Be sure to add the env variable REACT_APP_YOUR_API_KEY_HERE with the value of your api key

Run:
```
ionic build
```
```
ionic capacitor run [android | ios]
```


## DOC SDK
Read the avaialble documentation on:
https://lazarilloapp.github.io/lz-sdk-plugin/