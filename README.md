# @badcj/emailExists

@badcj/emailExists is a simple and lightweight JavaScript library for validating email with regex and mainly checking if the email exists in real or not.

## Installation

Use the node package manager to install @badcj/colours.

```bash
npm install @badcj/colours
```

## Usage

```javascript

const validate = require("@badcj/emailexists");

async function validateFunction(email){

    const isReal = await validate(email)

    console.log({isReal})

}

validateFunction("chiranjeevsehgal0@gmail.com") //correct , will print {isReal:true}

validateFunction("chiranjeevsehgal0@gmail.con") //incorrect , con instead of com , will print {isReal:false}

```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.