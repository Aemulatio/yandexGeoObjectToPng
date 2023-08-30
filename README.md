## Библиотека для скачивания геометрии прямоугольника или полигона. 
Кроме того позволит сохранить цветовую гамму переданной фигуры.


### Пример использования

```
function init() {
    const myMap = new window.ymaps.Map("map", {
      center: [55.674, 37.601],
      zoom: 11
    });

    const myRectangle = new window.ymaps.Rectangle([
      [55.66, 37.60],
      [55.71, 37.69]
    ], {}, {
      fillColor: "#7df9ff33",
      fillOpacity: 0.5,
      strokeColor: "#0000FF33",
      strokeOpacity: 0.5,
      strokeWidth: 2,
      borderRadius: 6
    });

    myMap.geoObjects.add(myRectangle);

    document.querySelector("#btn").addEventListener("click", () => {
      const png = new Geo2Png(myRectangle, 5, false, true);
      png.createPng();
    });
  }
```

- Первым делом необходимо подключить файл со скриптом
- Заинициализировать карту
- Создать на ней геометрический объект и обязательно добавить его на карту
- Проинициализировать класс, в который передать:
    - свою фигуру *
    - отступ от рамок
    - скачивать ли изображение сразу после обработки
    - сделать ли изображение размером в карту
- После вызвать метод .createPng()


## **Библиотека еще будет изменяться и документироваться в соответствии**
