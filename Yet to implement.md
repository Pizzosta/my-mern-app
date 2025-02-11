 **Field Defaults** : For fields like** **`image`, set a default value in your Mongoose schema instead of relying on user input.

**Validation in** **`createProducts`** and **createVideo** use joi or express-validator

this solves bad request 400 among the fields

* **Bid History** :
* Store bid history in a separate collection for scalability.
* **Bid Validation Enhancements** :
* Add additional checks to ensure bids are valid (e.g., minimum bid increment).

THINGS TO FIX

Cron job works

Bids can only be placed on active auctions

Bid amount must be greater than the product's base price

Bid amount must be higher than the current highest bid
