import { env } from "config";
import TwilioSDK from "twilio";
import twilio from "twilio";

class Twilio {
  private client: TwilioSDK.Twilio;

  constructor() {
    this.client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
  }

  /**
   * @description Send message sms to your phone number
   * @param message
   * @param phoneNumber
   */
  public sendMessage = async (message: string, phoneNumber: string) => {
    const response = await this.client.messages.create({
      body: message,
      from: env.TWILIO_NUMBER,
      to: phoneNumber,
    });
    return response;
  };

  get clientTwilio() {
    return this.client;
  }
}

export default new Twilio();
