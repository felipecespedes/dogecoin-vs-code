import axios from 'axios';
import { BigNumber } from "bignumber.js";

export class DogecoinService {

  static priceModes = {
    up: 'up',
    down: 'down',
    flat: 'flat'
  };

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

  static async getHistoricalData(): Promise<{ labels: string[], prices: number[] }> {
    const labels: string[] = [];
    const prices: number[] = [];
    const response = await axios.get('https://dogecoin-vs-code.s3.amazonaws.com/historical.json');
    const data = response.data.data;
    Object.keys(data).forEach(key => {
      const label = key.slice(0, 10);
      const price = data[key].USD[0];
      labels.push(label);
      prices.push(price);
    });

    return {
      labels,
      prices
    };
  }

  static async getAddressBalance(address: string): Promise<string> {
    const response = await axios.get(`https://sochain.com/api/v2/get_address_balance/DOGE/${address}`);
    const data = response.data?.data || {};
    const balance = data.confirmed_balance || "0";

    return balance;
  }

  static async isValidAddress(address: string): Promise<boolean> {
    let isValid = false;
    try {
      const response = await axios.get(`https://sochain.com/api/v2/is_address_valid/DOGE/${address}`);
      const data = response.data?.data || {};
      isValid = data.is_valid || false;
    } catch (err) {
      console.error(err);
      isValid = false;
    }

    return isValid;
  }

  static dogecoinToUSD(dogecoin: string, usd: string): string {
    try {
      const result = new BigNumber(dogecoin).multipliedBy(new BigNumber(usd));
      if (result.isNaN()) {
        return '';
      }
      return result.toString();
    } catch (err) {
      console.error(err);
      return '';
    }
  }

  static dogecoinToUSDWithSign(dogecoin: string, usd: string): string {
    const result = DogecoinService.dogecoinToUSD(dogecoin, usd);
    if (result === '') {
      return result;
    }

    return new BigNumber(result).isGreaterThan(0) ? `+${result}` : result;
  }

}
