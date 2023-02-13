const { axios, toBaseUnit, soliditySha3 } = MuonAppUtils

const getTimestamp = () => Math.floor(Date.now() / 1000)

async function getPrice() {
  const result = await axios.get('https://oracle1.deus.finance/xdai/price.json')
  return result.data
}

module.exports = {
  APP_NAME: 'deus_oracle',
  isService: true,

  onRequest: async function (request) {
    let {method, data: {params}} = request;
    switch (method) {
      case 'getPrice':
        let { name } = params
        let time = getTimestamp()

        if (!name) throw { message: 'Invalid name' }
        let info = await getPrice()
        name = name.toUpperCase();
        if(!info[name])
          throw {message: `price not found for symbol ${name}`}

        let price = info[name]['Long']['price']
        return { time, price }

      default:
        break
    }
  },

  hashRequestResult: function (request, result) {
    switch (request.method) {
      case 'getPrice':
        return soliditySha3([
          {
            type: 'uint256',
            value: request.data.result.time
          },
          { type: 'uint256', value: result.price }
        ])

      default:
        break
    }
  }
}
