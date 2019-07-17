/**
 * Endereco SDK.
 *
 * @author Ilja Weber <ilja@endereco.de>
 * @copyright 2019 mobilemojo – Apps & eCommerce UG (haftungsbeschränkt) & Co. KG
 * {@link https://endereco.de}
 */
function StreetAutocomplete(config) {
    var $self  = this;
    this.requestBody = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "streetAutocomplete",
        "params": {
            "street": "",
            "postCode": "",
            "cityName": "",
            "country": "de",
            "language": "de"
        }
    }
    this.defaultConfig = {
        'useWatcher': true,
        'tid': 'not_set'
    };
    this.fieldsAreSet = false;
    this.dirty = false;
    this.originalInput;
    this.config = Object.assign(this.defaultConfig, config);
    this.connector = new XMLHttpRequest();

    this.createEvent = function(eventName) {
        var event;
        if(typeof(Event) === 'function') {
            event = new Event(eventName);
        }else{
            event = document.createEvent('Event');
            event.initEvent(eventName, true, true);
        }
        return event;
    }

    /**
     * Helper function to update existing config, overwriting existing fields.
     *
     * @param newConfig
     */
    this.updateConfig = function(newConfig) {
        $self.config = Object.assign($self.config, newConfig);
    }

    /**
     * Checks if fields are set.
     */
    this.checkIfFieldsAreSet = function() {
        var areFieldsSet = false;
        if((null !== document.querySelector($self.config.inputSelector))) {
            areFieldsSet = true;
        }

        if (!$self.fieldsAreSet && areFieldsSet) {
            $self.dirty = true;
            $self.fieldsAreSet = true;
        } else if($self.fieldsAreSet && !areFieldsSet) {
            $self.fieldsAreSet = false;
        }
    }

    /**
     * Get predictions for the provided input.
     */
    this.getPredictions = function() {
        $self.activeElementIndex = -1;
        $self.originalInput = '';
        return new Promise( function(resolve, reject) {
            var countryCode = 'de';
            var countryElement;
            // On data receive
            $self.connector.onreadystatechange = function() {
                if(4 === $self.connector.readyState) {
                    if ($self.connector.responseText && '' !== $self.connector.responseText) {
                        $data = JSON.parse($self.connector.responseText);
                        if ($data.result) {
                            resolve($data);
                        } else {
                            reject($data);
                        }
                    } else {
                        reject($data);
                    }
                }
            };

            // Set request values.
            if ($self.inputElement) {
                $self.requestBody.params.street = $self.inputElement.value.trim();
            }

            // Set post code.
            if (undefined !== $self.config.secondaryInputSelectors.postCode && '' !== document.querySelector($self.config.secondaryInputSelectors.postCode).value.trim()) {
                $self.requestBody.params.postCode = document.querySelector($self.config.secondaryInputSelectors.postCode).value.trim();
            }

            // Set city name.
            if (undefined !== $self.config.secondaryInputSelectors.cityName && '' !== document.querySelector($self.config.secondaryInputSelectors.cityName).value.trim()) {
                $self.requestBody.params.cityName = document.querySelector($self.config.secondaryInputSelectors.cityName).value.trim();
            }

            // Set country.
            countryElement = document.querySelector($self.config.secondaryInputSelectors.country);
            if ((undefined !== countryElement) && (null !== countryElement)) {
                countryCode = countryElement.options[countryElement.selectedIndex].getAttribute('data-code');
                if ('' === countryCode) {
                    countryCode = countryElement.options[countryElement.selectedIndex].value;
                }
                if ('' === countryCode) {
                    countryCode = 'de';
                }
                $self.requestBody.params.country = countryCode;
            }

            // Set language
            if (undefined !== $self.config.language && '' !== $self.config.language) {
                $self.requestBody.params.language = $self.config.language;
            }

            $self.connector.open('POST', $self.config.endpoint, true);
            $self.connector.setRequestHeader("Content-type", "application/json");
            $self.connector.setRequestHeader("X-Auth-Key", $self.config.apiKey);
            $self.connector.setRequestHeader("X-Transaction-Id", $self.config.tid);
            $self.connector.setRequestHeader("X-Transaction-Referer", window.location.href);
            $self.connector.send(JSON.stringify($self.requestBody));
        });
    }

    /**
     * Renders predictions in a dropdown.
     */
    this.renderDropdown = function() {
        var ul;
        var li;
        var street;
        var input;
        if ('' === $self.originalInput) {
            input = $self.inputElement.value.trim();
            $self.originalInput = input;
        } else {
            input = $self.originalInput;
        }
        var counter = 0;
        var regEx;
        var replaceMask;
        var event;
        var selectedStreet;

        $self.removeDropdown();

        if (0 === $self.predictions.length) {
            return;
        }

        ul = document.createElement('ul');
        ul.style.zIndex = '9001';
        ul.style.borderRadius = '4px';
        ul.style.backgroundColor = '#fff';
        ul.style.border = '1px solid #dedede';
        ul.style.listStyle = 'none';
        ul.style.padding = '4px 4px';
        ul.style.margin = 0;
        ul.style.position = 'absolute';
        ul.style.top = 4 + $self.inputElement.offsetTop + $self.inputElement.offsetHeight + 'px';
        ul.style.left = $self.inputElement.offsetLeft + 'px';
        ul.setAttribute('class', 'endereco-dropdown')
        $self.dropdown = ul;
        $self.inputElement.parentNode.insertBefore(ul, $self.inputElement.nextSibling);

        // Iterate through list and create new elements
        $self.predictions.forEach( function(element) {
            li = document.createElement('li');
            li.style.cursor = 'pointer';
            li.style.color = '#000';
            li.style.padding = '2px 4px';
            li.style.margin = '0';
            li.setAttribute('data-index', counter);
            if (counter === $self.activeElementIndex) {
                li.style.backgroundColor = 'rgba(0, 137, 167, 0.25)';
            } else {
                li.style.backgroundColor = 'transparent';
            }
            li.addEventListener('mouseover', function() {
                this.style.backgroundColor = 'rgba(0, 137, 167, 0.25)';
            });

            li.addEventListener('mouseout', function() {
                this.style.backgroundColor =  'transparent';
            });

            regEx = new RegExp('(' + input + ')', 'ig');
            replaceMask = '<mark style="background-color: transparent; padding: 0; margin: 0; font-weight: 700; color: ' +  $self.config.colors.secondaryColor + '">$1</mark>';
            street = element.street.replace(regEx, replaceMask);
            li.innerHTML = street;
            li.setAttribute('data-street', element.street);

            // Register event
            li.addEventListener('mouseover', function(mEvent) {
                mEvent.preventDefault();
                selectedStreet = this.getAttribute('data-street');
                $self.inputElement.value = selectedStreet;
                $self.activeElementIndex = this.getAttribute('data-index') * 1;
            });

            li.addEventListener( 'mousedown', function(mEvent) {
                mEvent.preventDefault();

                event = $self.createEvent('endereco.valid');
                $self.inputElement.dispatchEvent(event);

                $self.removeDropdown();
            });

            $self.dropdown.appendChild(li);

            counter++;
        });
    };

    /**
     * Validate fields.
     */
    this.validate = function() {
        var input = $self.inputElement.value.trim();
        var event;
        var includes = false;

        $self.predictions.forEach( function(prediction) {
            if (input === prediction.street) {
                includes = true;
            }
        });

        if (includes) {
            event = $self.createEvent('endereco.valid');
            $self.inputElement.dispatchEvent(event);
        } else {
            event = $self.createEvent('endereco.check');
            $self.inputElement.dispatchEvent(event);
        }
    };

    /**
     * Removes dropdown from DOM.
     */
    this.removeDropdown = function() {
        if (null !== $self.dropdown && undefined !== $self.dropdown ) {
            $self.dropdown.parentElement.removeChild($self.dropdown);
            $self.dropdown = undefined;
        }
    };

    /**
     * Init postCodeAutocomplete.
     */
    this.init = function() {

        try {
            $self.inputElement = document.querySelector($self.config.inputSelector);
            $self.dropdown = undefined;
            $self.dropdownDraw = true;
            $self.predictions = [];
            $self.activeElementIndex = -1;
        } catch(e) {
            console.log('Could not initiate StreetAutocomplete because of error.', e);
        }

        // Generate TID if accounting service is set.
        if (window.accounting && ('not_set' === $self.config.tid)) {
            $self.config.tid = window.accounting.generateTID();
        }

        // Disable browser autocomplete
        if ($self.isChrome()) {
            $self.inputElement.setAttribute('autocomplete', 'autocomplete_' + Math.random().toString(36).substring(2) + Date.now());
        } else {
            $self.inputElement.setAttribute('autocomplete', 'off' );
        }

        // Register events
        $self.inputElement.addEventListener('input', function() {
            var $this = this;
            var acCall = $self.getPredictions();
            acCall.then( function($data) {
                $self.predictions = $data.result.predictions;
                if ($this === document.activeElement) {
                    $self.renderDropdown();
                }
                $self.validate();
            });
        });

        // Register blur event
        $self.inputElement.addEventListener('blur', function() {
            $self.removeDropdown();
            $self.validate();
        });

        // Register mouse navigation
        $self.inputElement.addEventListener('keydown', function(mEvent) {
            var event;
            if ('ArrowUp' === mEvent.code) {
                mEvent.preventDefault();
                if (0 < $self.activeElementIndex) {
                    $self.activeElementIndex--;
                }

                // Prefill selection to input
                $self.inputElement.value = $self.predictions[$self.activeElementIndex].street;

                $self.renderDropdown();
            }

            if ('ArrowDown' === mEvent.code) {
                mEvent.preventDefault();
                if ($self.activeElementIndex < ($self.predictions.length-1)) {
                    $self.activeElementIndex++;
                }

                // Prefill selection to input
                $self.inputElement.value = $self.predictions[$self.activeElementIndex].street;
                $self.renderDropdown();
            }

            if ('Enter' === mEvent.code) {
                mEvent.preventDefault();

                // If only one prediction.
                if (1 === $self.predictions.length) {
                    // Prefill selection to input
                    $self.inputElement.value = $self.predictions[0].street;
                }

                // Then.
                event = $self.createEvent('endereco.valid');
                $self.inputElement.dispatchEvent(event);

                $self.removeDropdown();
            }
        });

        $self.dirty = false;

        console.log('StreetAutocomplete instantiated.');
    }

    // Check if the browser is chrome
    this.isChrome = function() {
        return /chrom(e|ium)/.test( navigator.userAgent.toLowerCase( ) );
    }

    // Service loop.
    setInterval( function() {

        if ($self.config.useWatcher) {
            $self.checkIfFieldsAreSet();
        }

        if ($self.dirty) {
            $self.init();
        }
    }, 300);
}
