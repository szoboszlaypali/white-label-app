# WhiteLabelApp

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.0.9.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).


# Documentation

A small white label app that uses config.json and related css files to generate a single page application.

## Configuring config.json

### pages

To define routes/pages, update the config's pages field. The page name will be used as the route name.
The templates that you want to use for header, content and footer can be set in this object as well.
Each template name used in the sections must exist in the templates section as keys.

### templates

The currently available template settings are:
```
{
    "type": [any html element name] or "grid";
    "for": string (if the type is grid, should be a jpath expression pointing to a state array);
    "classNames": str[];
    "href": string (if the type is 'a')
    "src": string (if the type is img)
    "text": string;
    "items": templateSetting[]
}
```

### state and jpath references in the template's "text", "href", "src", "for" values

The aforementioned values can contain jpath references wrapped between curly braces.
These references can point to either a response of an api call, the data field of the config.json, or the route params array.
During rendering, these values will be resolved and replaced if possible.
