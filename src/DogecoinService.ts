import axios from 'axios';

export class DogecoinService {

  static async getPrice() {
    try {
      const API_URL = 'https://www.dogecoinextension.xyz/api/v1/DOGE/price';
      const response = await axios.get(API_URL);
      if (response.status === 200) {
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
