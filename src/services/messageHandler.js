import whatsappService from './whatsappService.js';

class MessageHandler {
  async handleIncomingMessage(message, senderInfo) {
    const mediaKeywords=["listado", "lista", "precios", "lista de precios", "listado de precios"];
    if (message?.type === 'text') {
      const incomingMessage = message.text.body.toLowerCase().trim();

      if(this.isGreeting(incomingMessage)){
        await this.sendWelcomeMessage(message.from, message.id, senderInfo);
        await this.sendWelcomeMenu(message.from);
      } else if(mediaKeywords.some(keyword => incomingMessage.includes(keyword))){
        await this.sendMedia(message.from);
      }
      // else{
      //   const response = `${message.text.body}`;
      //   await whatsappService.sendMessage(message.from, response, message.id);
      // }
      await whatsappService.markAsRead(message.id);
    } else if(message?.type === 'interactive'){
      const formatNumber = message.from.slice(0,2) + message.from.slice(3);
      const option = message?.interactive?.button_reply?.id;
      //response to menu option
      await this.handleMenuOption(message.from, option);
      await whatsappService.markAsRead(message.id);
    }
  }

  isGreeting(message) {
    const greetings = ["hola", "buenas", "buenas tardes", "buenos dias"];
    return greetings.some(word => message.includes(word.toLowerCase()));
    // return greetings.includes(message);
  } 

  getSenderName(senderInfo){
    return senderInfo.profile?.name || senderInfo.wa_id;
  }

  async sendWelcomeMessage(to, messageId, senderInfo) {
    const name = this.getSenderName(senderInfo);
    const formattedName = this.nameFormat(name);
    const welcomeMessage = `¡Saludos! ${formattedName}, Bienvenido a Covadonga Express. 👑`;
    await whatsappService.sendMessage(to, welcomeMessage, messageId);
  }
  
  //formatting name so it gets ONLY the user name
  nameFormat(name){
    const noSpecialCharacters = name.replace(/[^a-zA-Z\s]/g,'');
    const firstName = noSpecialCharacters.trim().split(/\s+/);
    return firstName.length > 0 ? firstName[0] : '';
  }
  
  //buttons sedes
  async sendWelcomeMenu(to){
    const menuMessage = "¿Con cuál sede deseas comunicarte?";
    //array de objetos
    const buttons = [
      {type: 'reply', reply:{id:'option1',title:'C.C.I Satalino'}},
      {type:'reply', reply:{id:'option2',title:'Calicanto'}},
      // {type:'reply', reply:{id:'option3',title:'Av. Intercomunal'}}
    ];

    await whatsappService.sendInteractiveButton(to, menuMessage, buttons);
  }
  
  async handleMenuOption(to, option,messageId){
    let response;
    switch(option){
      case 'option1': response="wa.me/584142860864";break;
      case 'option2': response="Se esta comunicando con Covadonga Express sede Calicanto. ¿En qué lo podemos ayudar? 😁";break;
      // case 'option3': response="wa.me/";break;
      // default: response="";
    }
    await whatsappService.sendMessage(to,response, messageId);
  }

  async sendMedia(to){
    const mediaUrl = 'https://storage.googleapis.com/covadonga_express/LISTA%20ACTUALIZADA%20%2013032025.pdf';
    const caption = 'Listado de precios';
    const type = 'document';
    await whatsappService.sendMediaMessage(to, type,mediaUrl,caption);
  }
}

export default new MessageHandler();