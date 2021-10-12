
var dns = require('dns');
var net = require('net');
var promisify = require('js-promisify');

// validate email based on regex
const REGEX = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

function validateStructure (email) {

    if (typeof email === 'string' && email.length > 5 && email.length < 61 && REGEX.test(email)) {
      return email.toLowerCase();
    } else {
      return false;
    }

}

function addressAccToPriority(addresses) {

  if (addresses.length === 1) {
    return addresses[0].exchange;
  } else {
      // Find the lowest priority mail server
      var lowestPriorityIndex = 0;
      var lowestPriority = addresses[0].priority;
      for (var i = 1; i < addresses.length; i++) {
        var currentPriority = addresses[i].priority;
        if (currentPriority < lowestPriority) {
          lowestPriority = currentPriority;
          lowestPriorityIndex = i;
        }
      }
      return addresses[lowestPriorityIndex].exchange;
  }
  
}

async function testSocket(host,email,address) {

  var step = 0;

  const COMM = [
    'helo ' + host + '\n',
    'mail from:<' + email + '>\n',
    'rcpt to:<' + email + '>\n'
  ];

  return new Promise(async function (resolve, reject) {

    var socket = net.createConnection(25, address);

    socket.setTimeout(5000, function () {
      socket.destroy();
      resolve(false);
    });
    socket.on('data', function (data) {
      if (data.toString()[0] !== '2') {
        socket.destroy();
        reject(new Error('refuse'));
      }
      if (step < 3) {
        socket.write(COMM[step], function () {
          step++;
        });
      } else {
        socket.destroy();
        resolve(true);
      }
    });
    socket.on('error', function (err) {
      socket.destroy();
      if (err.code === 'ECONNRESET') {
        reject(new Error('refuse'));
      } else {
        reject(new Error("err"));
      }
    })
  });
  
}

async function resolveMx (validateAndGetDomain) {

  try{

    const addresses = await promisify(dns.resolveMx, [validateAndGetDomain])

    return addresses;

  }
  catch(e){
    // return new Error(e)
    return false
  }

}

async function validate(email) {

    let validated = false ;

    const validateAndGetDomain = validateStructure(email) ? email.split('@')[1] : false ;

    let addresses;

    if(validateAndGetDomain){
      addresses = await resolveMx(validateAndGetDomain)
    }

    if(!addresses){
      return false
    }

    const address = addressAccToPriority(addresses);

    validated = await testSocket(validateAndGetDomain,email,address)

    return validated;
    
}


module.exports = validate;