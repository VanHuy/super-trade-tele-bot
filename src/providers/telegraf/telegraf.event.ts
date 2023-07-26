import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { TelegrafContext } from "telegraf/typings/context";
import { Extra, Markup, session, Stage } from "telegraf";
import {
  START, NEW_WALLET, EXIST_WALLET, BUY_TOKEN, ALL_FUNC,
  IMPORT_PRIVATE_KEY_SUCCESS, SETTINGS, EDIT_GAS, GAS_UPDATED,
  SLIPPAGE, SLIPPAGE_UPDATEED, CREATE_NEW_ORDER, BUY_ORDER, SELL_ORDER,
  CREATE_NEW_ORDER_TOKEN, CREATE_NEW_ORDER_AMOUNT, CREATE_NEW_ORDER_SUCCESS
} from "../../common/constant";
import { getBalances, getTokenInfo, getTokenInfoEtherplorer } from 'src/common/httpApi';
const { Web3 } = require('web3');
const WizardScene = require('telegraf/scenes/wizard')

var web3 = new Web3(process.env.ETH_RPC); // your geth
const ERC20_INTERFACE_ID = '0x36372b07';

@Injectable()
export class TelegrafEvent implements OnModuleInit {
  private readonly logger: Logger = new Logger(TelegrafEvent.name);
  constructor() { }

  onModuleInit() {
    // Wizard and scene
    this.createWizard()
    this.registerCommand();

  }
  async createWizard() {
    const importWalletWizard = getWizardImportWallet()
    const editSlippageWizard = getWizardEditSlippage()
    const createOrderWizard = getWizardCreateOrder()

    // Tạo một stage để quản lý các scene và wizard
    const stage = new Stage([importWalletWizard, editSlippageWizard, createOrderWizard])

    // Sử dụng session và stage middleware cho bot
    global.bot.use(session())
    global.bot.use(stage.middleware())
  }

  async registerCommand() {
    //start commands prints the menu
    global.bot.start(this.printStatsMenu);
    global.bot.command('functions', this.handleFunctions);
    global.bot.command('settings', this.handleSettings);
    global.bot.command('sellP', this.buyTokens);
    global.bot.command('info', this.buyTokens);
    global.bot.command('balance', this.handleBalances);
    global.bot.command('order', this.handleOrders);
    global.bot.command('buy', this.buyTokens);
    global.bot.command('sell', this.buyTokens);
    global.bot.command('snipe', this.buyTokens);
    global.bot.command('cancelSnipe', this.buyTokens);
    global.bot.command('approve', this.buyTokens);
    global.bot.command('multibuy', this.buyTokens);
    global.bot.command('multisell', this.buyTokens);
    global.bot.command('multisnipe', this.buyTokens);
    global.bot.command('multibalance', this.buyTokens);

    //register switchToCreateNewWallet action
    global.bot.action("CreateNewWallet", this.switchToCreateNewWallet);
    //register ImportExistWallet action
    global.bot.action("ImportExistWallet", this.switchToImportExistWallet);

    global.bot.action("EditGas", this.editGas);
    global.bot.action("EditSlippage", this.editSlippage);
    global.bot.action("MediumGas", this.mediumGas);
    global.bot.action("HighGas", this.highGas);
    global.bot.action("BuyOrder", this.buyOrder);
    global.bot.action("SellOrder", this.sellOrder);
  }
  async buyOrder(ctx) {
    await ctx.answerCbQuery();
    return ctx.reply(BUY_ORDER);
  }

  async sellOrder(ctx) {
    await ctx.answerCbQuery();
    return ctx.reply(SELL_ORDER);
  }

  highGas(ctx: TelegrafContext) {
    return ctx.reply(GAS_UPDATED);
  }

  mediumGas(ctx: TelegrafContext) {
    return ctx.reply(GAS_UPDATED);
  }

  async editSlippage(ctx) {
    await ctx.answerCbQuery();
    ctx.scene.enter('edit-slippage-wizard');
  }

  editGas(ctx: TelegrafContext) {
    return ctx.reply(
      EDIT_GAS,
      Extra.HTML().markup((m: any) =>
        Markup.inlineKeyboard([
          m.callbackButton(`Medium`, "MediumGas"),
          m.callbackButton(`High`, "HighGas"),
        ]),
      ),
    );
  }

  handleOrders(ctx) {
    // ctx.answerCbQuery();
    ctx.scene.enter('create-order-wizard');
  }

  handleInfo(ctx: TelegrafContext, arg0: string) {
    return ctx.reply("Wellcome");
  }

  async handleBalances(ctx: TelegrafContext) {
    const balances = await getBalances('0xdAC17F958D2ee523a2206206994597C13D831ec7')
    return ctx.reply(balances, { disable_web_page_preview: true, reply_to_message_id: ctx.message.message_id });
  }

  handleSellP(ctx: TelegrafContext) {
    return ctx.reply("Wellcome");
  }

  async printStatsMenu(ctx: TelegrafContext) {
    return ctx.reply(
      START.replace('<USER>', ctx.from.first_name),
      Extra.HTML().markup((m: any) =>
        Markup.inlineKeyboard([
          m.callbackButton(`Create New Wallet`, "CreateNewWallet"),
          m.callbackButton(`Import Exist Wallet`, "ImportExistWallet"),
        ]),
      ),
    );
  }

  async switchToCreateNewWallet(ctx: TelegrafContext) {
    await ctx.answerCbQuery();
    var account = web3.eth.accounts.create();
    const mess = NEW_WALLET.replace('<PRIVATE-KEY>', account.privateKey).replace('<WALLET-ADDRESS>', account.address)
    return ctx.reply(mess);
  }

  async switchToImportExistWallet(ctx) {
    await ctx.answerCbQuery();
    ctx.scene.enter('import-wallet-wizard');
  }

  async buyTokens(ctx: TelegrafContext) {
    return ctx.replyWithHTML(BUY_TOKEN, { disable_web_page_preview: true, reply_to_message_id: ctx.message.message_id });
  }
  async handleFunctions(ctx: TelegrafContext) {
    return ctx.reply(ALL_FUNC, { disable_web_page_preview: true, reply_to_message_id: ctx.message.message_id });
  }
  async handleSettings(ctx: TelegrafContext) {
    return ctx.reply(
      SETTINGS,
      Extra.HTML().markup((m: any) =>
        Markup.inlineKeyboard([
          m.callbackButton(`Edit gas`, "EditGas"),
          m.callbackButton(`Edit slippage`, "EditSlippage"),
        ]),
      ),
    );
  }
}

function getWizardImportWallet() {
  return new WizardScene(
    'import-wallet-wizard',
    ctx => {
      ctx.reply(EXIST_WALLET);
      return ctx.wizard.next()
    },
    ctx => {
      const privateKey = ctx.message.text
      try {
        var account = web3.eth.accounts.privateKeyToAccount(privateKey);
      } catch (error) {
        ctx.reply('Invalid Private Key, please import again', { reply_to_message_id: ctx.message.message_id })
        return ctx.scene.leave()
      }
      ctx.reply(IMPORT_PRIVATE_KEY_SUCCESS.replace('<WALLET-ADDRESS>', account.address), { reply_to_message_id: ctx.message.message_id })

      return ctx.scene.leave()
    }
  )
}

function getWizardEditSlippage() {
  return new WizardScene(
    'edit-slippage-wizard',
    ctx => {
      ctx.reply(SLIPPAGE);
      return ctx.wizard.next()
    },
    ctx => {
      const slippageText = ctx.message.text
      try {
        if (isNaN(slippageText)) {
          ctx.reply('Wrong format for the slippage ❌', { reply_to_message_id: ctx.message.message_id })
          return ctx.scene.leave()
        }
      } catch (error) {
        ctx.reply('Wrong format for the slippage ❌', { reply_to_message_id: ctx.message.message_id })
        return ctx.scene.leave()
      }
      ctx.reply(SLIPPAGE_UPDATEED.replace('<NEW-SLIPPAGE>', slippageText), { reply_to_message_id: ctx.message.message_id })

      return ctx.scene.leave()
    }
  )
}

function getWizardCreateOrder() {
  return new WizardScene(
    'create-order-wizard',
    async (ctx) => {
      await ctx.reply(
        CREATE_NEW_ORDER,
        Extra.HTML().markup((m: any) =>
          Markup.inlineKeyboard([
            m.callbackButton(`Buy Order`, "BuyOrder"),
            m.callbackButton(`Sell Order`, "SellOrder"),
          ]),
        ),
      );
      return ctx.wizard.next()
    },
    async (ctx) => {
      if (ctx.update?.callback_query?.data == 'BuyOrder') {
        ctx.reply(BUY_ORDER);
      }
      if (ctx.update?.callback_query?.data == 'SellOrder') {
        ctx.reply(SELL_ORDER);
      }
      return ctx.wizard.next()
    },
    async (ctx) => {
      console.log('message: ', ctx.message);

      if (!ctx.message) {
        return ctx.scene.leave();
      }
      const contractAddress = ctx.message.text
      let result;
      try {
        if (!web3.utils.isAddress(contractAddress)) {
          ctx.reply('Wrong format for contract address ❌', { reply_to_message_id: ctx.message.message_id })
          return ctx.scene.leave()
        }
        result = await getTokenInfoEtherplorer(contractAddress)
        if (!result) {
          ctx.reply(`Can't find contract address ❌`, { reply_to_message_id: ctx.message.message_id })
        }
      } catch (error) {
        console.log('error: ', error);
        ctx.reply(`Contract address doest't supported ❌`, { reply_to_message_id: ctx.message.message_id })
        return ctx.scene.leave()
      }
      ctx.wizard.state.tokenName = result.name
      ctx.wizard.state.price = result.price
      console.log('result.price?.rate', result.price);
      ctx.reply(CREATE_NEW_ORDER_TOKEN.replace('<TOKEN>', result.name), { reply_to_message_id: ctx.message.message_id })
      return ctx.wizard.next()
    },
    async (ctx) => {
      const amount = ctx.message.text
      if (isNaN(amount)) {
        ctx.reply('Invalid Amount', { reply_to_message_id: ctx.message.message_id })
        return ctx.scene.leave()
      }
      const price = ctx.wizard.state.price;
      ctx.wizard.state.tokenAmount = amount;
      const tokenName = ctx.wizard.state.tokenName;
      ctx.reply(CREATE_NEW_ORDER_AMOUNT.replace('<TOKEN-NAME>', tokenName).replace('<PRICE>', price), { reply_to_message_id: ctx.message.message_id })
      return ctx.wizard.next()
    },
    async (ctx) => {
      const price = ctx.message.text
      if (isNaN(price)) {
        ctx.reply('Invalid Price', { reply_to_message_id: ctx.message.message_id })
        return ctx.scene.leave()
      }
      const tokenName = ctx.wizard.state.tokenName;
      const tokenAmount = ctx.wizard.state.tokenAmount;
      ctx.reply(CREATE_NEW_ORDER_SUCCESS.replace('<TOKEN-NAME>', tokenName).replace('<TOKEN-AMOUNT>', tokenAmount).replace('<PRICE>', price), { reply_to_message_id: ctx.message.message_id })
      return ctx.scene.leave()
    },
  )
}

