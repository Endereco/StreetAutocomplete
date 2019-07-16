# StreetAutocomplete

Assist the input of street. When user enters first characters of a street it shows a dropdown with street variants. User can select a variant by clicking on it or by navigating to it with keyboard arrows and pressing enter. When selected a variant is copied to the input field of street name.

## Installation

In order to pull the latest version:

### npm (preferred)

```
npm i @endereco/streetautocomplete
```

### github

```
git clone https://github.com/Endereco/StreetAutocomplete.git
```

Then include StreetAutocomplete.js in `<header>` or before config.

## Configuration

In order to use street autocomplete you must specify the fields that make the street, postcode, city name and country, and some colors.

Here is an example configuration:

```
new StreetAutocomplete({
    'inputSelector': 'input[name="register[billing][streetname]"]',
    'secondaryInputSelectors': {
        'postCode': 'input[name="register[billing][zipcode]"]',
        'cityName': 'input[name="register[billing][city]"]',
        'country': 'select[name="register[billing][country]"]'
    },
    'endpoint': 'https://example-domain.com/endpoint',
    'apiKey': '041c3c302746cf37722560a7a285690738a7db4e55b7aaf26a545ffabd318a83',
    'colors' : {
        'primaryColor' => '#fff',
        'primaryColorHover' => '#fff',
        'primaryColorText' => '#fff',
        'secondaryColor' => '#fff',
        'secondaryColorHover' => '#fff',
        'secondaryColorText' => '#fff',
        'warningColor' => '#fff',
        'warningColorHover' => '#fff',
        'warningColorText' => '#fff',
        'successColor' => '#fff',
        'successColorHover' => '#fff',
        'successColorText' => '#fff'
     }
});
```

## Dependencies

StreetAutocomplete relies on StatusIndicator to mark fields green on correct input.

StreetAutocomplete also relies on Accounting to generate the tid and track transactions.

## Methods

### updateConfig(object newConfig)

Updates inner config. Existing fields are overwritten, new fields are added, other field are kept.

### checkIfFieldsAreSet()

Checks if all relevant fields are set and marks the service as "dirty", if there was a change. Dirty state trigger reinitialisation.

### getPredictions()

Get a list of possible street names for the provided input. Returns a promise that is resolved once the answer from remote server is in.


### renderDropdown()

Renders the autocomplete list.

### removeDropdown()

Removes autocomplete list from DOM.
