THINGS TO ADD


```
import { useNavigate } from "react-router-dom";
```


**Field Defaults** : For fields like** **`image`, set a default value in your Mongoose schema instead of relying on user input.

**Validation in** **`createProducts`** and **createVideo** use joi or express-validator

this solves bad request 400 among the fields

* **Bid History** :
* Store bid history in a separate collection for scalability.
* **Bid Validation Enhancements** :
* Add additional checks to ensure bids are valid (e.g., minimum bid increment).

THINGS TO FIX

Price isnt working on the update card

we need to validate the entire ()update product page) product card

createpage "textarea"
