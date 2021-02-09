import axios from 'axios';

export class DogecoinService {

  static async getPrice() {
    try {
      const API_URL = 'https://dogecoin-vs-code.s3.amazonaws.com/dogecoin.json';
      const response = await axios.get(API_URL);
      if (response.status === 200) {
        // const prices = response.data?.data?.prices;
        // let price;
        // if (Array.isArray(prices) && prices.length > 0) {
        //   price = prices[0].price;
        // } else {
        //   return { error: 'no prices' };
        // }
        const price = response.data.price;
        const changeInPrice = response.data.changeInPrice;
        const changeInPercentage = response.data.changeInPercentage;
        if (price != null) {
          return { price, changeInPrice, changeInPercentage, error: false };
        } else {
          return { error: 'price is null' };
        }
      } else {
        return { error: 'response status !== 200' };
      }
    } catch (err) {
      return { error: err };
    }
  }

}