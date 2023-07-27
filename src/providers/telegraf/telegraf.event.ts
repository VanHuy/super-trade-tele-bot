import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { TelegrafContext } from 'telegraf/typings/context';
import { Extra, Markup, session, Stage } from 'telegraf';
import { UsersService } from 'src/users/users.service';
import {
  START,
  NEW_WALLET,
  EXIST_WALLET,
  BUY_TOKEN,
  ALL_FUNC,
  IMPORT_PRIVATE_KEY_SUCCESS,
  SETTINGS,
  EDIT_GAS,
  GAS_UPDATED,
  SLIPPAGE,
  SLIPPAGE_UPDATEED,
  CREATE_NEW_ORDER,
  BUY_ORDER,
  SELL_ORDER,
  CREATE_NEW_ORDER_TOKEN,
  CREATE_NEW_ORDER_AMOUNT,
  CREATE_NEW_ORDER_SUCCESS,
  TRADE_SUCCESS,
  TRADE_FAILED,
} from '../../common/constant';
import {
  getBalances,
  getTokenInfo,
  getTokenInfoEtherplorer,
} from 'src/common/httpApi';
import { swapEthToTokens, swapTokensToEth } from '../exchange/uniswap';
const { Web3 } = require('web3');
const WizardScene = require('telegraf/scenes/wizard');

const web3 = new Web3(process.env.ETH_RPC); // your geth
let userService: UsersService;

@Injectable()
export class TelegrafEvent implements OnModuleInit {
  private readonly logger: Logger = new Logger(TelegrafEvent.name);
  constructor(private user: UsersService) {}

  onModuleInit() {
    userService = this.user;
    // Wizard and scene
    this.createWizard();
    this.registerCommand();
  }
  async createWizard() {
    const importWalletWizard = getWizardImportWallet();
    const editSlippageWizard = getWizardEditSlippage();
    const createOrderWizard = getWizardCreateOrder();

    // Tạo một stage để quản lý các scene và wizard
    const stage = new Stage([
      importWalletWizard,
      editSlippageWizard,
      createOrderWizard,
    ]);

    // Sử dụng session và stage middleware cho bot
    global.bot.use(session());
    global.bot.use(stage.middleware());
  }

  async registerCommand() {
    // start commands prints the menu
    global.bot.start(this.printStatsMenu);
    global.bot.command('functions', this.handleFunctions);
    global.bot.command('settings', this.handleSettings);
    global.bot.command('sellP', this.needPurchased);
    global.bot.command('info', this.needPurchased);
    global.bot.command('balance', this.handleBalances);
    global.bot.command('order', this.handleOrders);
    global.bot.command('buy', this.buyTokens);
    global.bot.command('sell', this.buyTokens);
    global.bot.command('snipe', this.needPurchased);
    global.bot.command('cancelSnipe', this.needPurchased);
    global.bot.command('approve', this.needPurchased);
    global.bot.command('multibuy', this.needPurchased);
    global.bot.command('multisell', this.needPurchased);
    global.bot.command('multisnipe', this.needPurchased);
    global.bot.command('multibalance', this.needPurchased);

    // register switchToCreateNewWallet action
    global.bot.action('CreateNewWallet', this.switchToCreateNewWallet);
    // register ImportExistWallet action
    global.bot.action('ImportExistWallet', this.switchToImportExistWallet);

    global.bot.action('EditGas', this.editGas);
    global.bot.action('EditSlippage', this.editSlippage);
    global.bot.action('MediumGas', this.setGas);
    global.bot.action('HighGas', this.setGas);
    global.bot.action('BuyOrder', this.buyOrder);
    global.bot.action('SellOrder', this.sellOrder);
  }
  async buyOrder(ctx) {
    await ctx.answerCbQuery();
    return ctx.reply(BUY_ORDER);
  }

  async sellOrder(ctx) {
    await ctx.answerCbQuery();
    return ctx.reply(SELL_ORDER);
  }

  setGas(ctx: TelegrafContext) {
    userService.updateGas(
      ctx.from.id.toString(),
      ctx.update?.callback_query?.data,
    );
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
          m.callbackButton(`Medium`, 'MediumGas'),
          m.callbackButton(`High`, 'HighGas'),
        ]),
      ),
    );
  }

  handleOrders(ctx) {
    // ctx.answerCbQuery();
    ctx.scene.enter('create-order-wizard');
  }

  handleInfo(ctx: TelegrafContext, arg0: string) {
    return ctx.reply('Wellcome');
  }

  async handleBalances(ctx: TelegrafContext) {
    const user = await userService.findUserByUserId(ctx.from.id.toString());
    const balances = await getBalances(user.walletAddress);
    return ctx.reply(balances, {
      disable_web_page_preview: true,
      reply_to_message_id: ctx.message.message_id,
    });
  }

  handleSellP(ctx: TelegrafContext) {
    return ctx.reply('Wellcome');
  }

  async printStatsMenu(ctx: TelegrafContext) {
    return ctx.reply(
      START.replace('<USER>', ctx.from.first_name),
      Extra.HTML().markup((m: any) =>
        Markup.inlineKeyboard([
          m.callbackButton(`Create New Wallet`, 'CreateNewWallet'),
          m.callbackButton(`Import Exist Wallet`, 'ImportExistWallet'),
        ]),
      ),
    );
  }

  async switchToCreateNewWallet(ctx: TelegrafContext) {
    await ctx.answerCbQuery();
    const account = web3.eth.accounts.create();
    const mess = NEW_WALLET.replace(
      '<PRIVATE-KEY>',
      account.privateKey,
    ).replace('<WALLET-ADDRESS>', account.address);
    userService.updateWallet(
      ctx.from.id.toString(),
      account.address,
      account.privateKey,
    );
    return ctx.reply(mess);
  }

  async switchToImportExistWallet(ctx) {
    await ctx.answerCbQuery();
    ctx.scene.enter('import-wallet-wizard');
  }

  async buyTokens(ctx: TelegrafContext) {
    const input = ctx.message.text;
    console.log('input', ctx);
    const listInput = input.split(' ');
    if (listInput.length < 3) {
      return ctx.replyWithHTML('Invalid input, please try again', {
        disable_web_page_preview: true,
        reply_to_message_id: ctx.message.message_id,
      });
    }
    const type = listInput[0].trim();
    const tokenAddress = listInput[1];
    const amount = listInput[2];
    if (!web3.utils.isAddress(tokenAddress)) {
      return ctx.reply('Invalid Token Address, please try again ❌', {
        reply_to_message_id: ctx.message.message_id,
      });
    }
    if (isNaN(Number(amount))) {
      return ctx.reply('Invalid Amount, please try again ❌', {
        reply_to_message_id: ctx.message.message_id,
      });
    }
    const user = await userService.findUserByUserId(ctx.from.id.toString());
    const privateKey = user.privateKey;
    const recipient = user.walletAddress;
    let txId;
    if (type.toLowerCase() == '/buy') {
      txId = await swapEthToTokens(tokenAddress, amount, privateKey, recipient);
    }
    if (type.toLowerCase() == '/sell') {
      txId = await swapTokensToEth(tokenAddress, amount, privateKey, recipient);
    }
    console.log('txId: ', txId);

    if (txId == null) {
      return ctx.replyWithHTML(TRADE_FAILED, {
        disable_web_page_preview: true,
        reply_to_message_id: ctx.message.message_id,
      });
    }
    return ctx.replyWithHTML(TRADE_SUCCESS, {
      disable_web_page_preview: true,
      reply_to_message_id: ctx.message.message_id,
    });
  }

  async needPurchased(ctx: TelegrafContext) {
    return ctx.replyWithHTML(BUY_TOKEN, {
      disable_web_page_preview: true,
      reply_to_message_id: ctx.message.message_id,
    });
  }

  async handleFunctions(ctx: TelegrafContext) {
    return ctx.reply(ALL_FUNC, {
      disable_web_page_preview: true,
      reply_to_message_id: ctx.message.message_id,
    });
  }
  async handleSettings(ctx: TelegrafContext) {
    return ctx.reply(
      SETTINGS,
      Extra.HTML().markup((m: any) =>
        Markup.inlineKeyboard([
          m.callbackButton(`Edit gas`, 'EditGas'),
          m.callbackButton(`Edit slippage`, 'EditSlippage'),
        ]),
      ),
    );
  }
}

function getWizardImportWallet() {
  return new WizardScene(
    'import-wallet-wizard',
    (ctx) => {
      ctx.reply(EXIST_WALLET);
      return ctx.wizard.next();
    },
    (ctx) => {
      const privateKey = ctx.message.text;
      let account;
      try {
        account = web3.eth.accounts.privateKeyToAccount(privateKey);
      } catch (error) {
        ctx.reply('Invalid Private Key, please import again', {
          reply_to_message_id: ctx.message.message_id,
        });
        return ctx.scene.leave();
      }
      userService.updateWallet(
        ctx.from.id.toString(),
        account.address,
        account.privateKey,
      );
      ctx.reply(
        IMPORT_PRIVATE_KEY_SUCCESS.replace('<WALLET-ADDRESS>', account.address),
        { reply_to_message_id: ctx.message.message_id },
      );

      return ctx.scene.leave();
    },
  );
}

function getWizardEditSlippage() {
  return new WizardScene(
    'edit-slippage-wizard',
    (ctx) => {
      ctx.reply(SLIPPAGE);
      return ctx.wizard.next();
    },
    (ctx) => {
      const slippageText = ctx.message.text;
      try {
        if (isNaN(slippageText)) {
          ctx.reply('Wrong format for the slippage ❌', {
            reply_to_message_id: ctx.message.message_id,
          });
          return ctx.scene.leave();
        }
      } catch (error) {
        ctx.reply('Wrong format for the slippage ❌', {
          reply_to_message_id: ctx.message.message_id,
        });
        return ctx.scene.leave();
      }
      ctx.reply(SLIPPAGE_UPDATEED.replace('<NEW-SLIPPAGE>', slippageText), {
        reply_to_message_id: ctx.message.message_id,
      });

      return ctx.scene.leave();
    },
  );
}

function getWizardCreateOrder() {
  return new WizardScene(
    'create-order-wizard',
    async (ctx) => {
      await ctx.reply(
        CREATE_NEW_ORDER,
        Extra.HTML().markup((m: any) =>
          Markup.inlineKeyboard([
            m.callbackButton(`Buy Order`, 'BuyOrder'),
            m.callbackButton(`Sell Order`, 'SellOrder'),
          ]),
        ),
      );
      return ctx.wizard.next();
    },
    async (ctx) => {
      if (ctx.update?.callback_query?.data == 'BuyOrder') {
        ctx.reply(BUY_ORDER);
      }
      if (ctx.update?.callback_query?.data == 'SellOrder') {
        ctx.reply(SELL_ORDER);
      }
      return ctx.wizard.next();
    },
    async (ctx) => {
      console.log('message: ', ctx.message);

      if (!ctx.message) {
        return ctx.scene.leave();
      }
      const contractAddress = ctx.message.text;
      let result;
      try {
        if (!web3.utils.isAddress(contractAddress)) {
          ctx.reply('Wrong format for contract address ❌', {
            reply_to_message_id: ctx.message.message_id,
          });
          return ctx.scene.leave();
        }
        result = await getTokenInfoEtherplorer(contractAddress);
        if (!result) {
          ctx.reply(`Can't find contract address ❌`, {
            reply_to_message_id: ctx.message.message_id,
          });
        }
      } catch (error) {
        console.log('error: ', error);
        ctx.reply(`Contract address doest't supported ❌`, {
          reply_to_message_id: ctx.message.message_id,
        });
        return ctx.scene.leave();
      }
      ctx.wizard.state.tokenName = result.name;
      ctx.wizard.state.price = result.price;
      console.log('result.price?.rate', result.price);
      ctx.reply(CREATE_NEW_ORDER_TOKEN.replace('<TOKEN>', result.name), {
        reply_to_message_id: ctx.message.message_id,
      });
      return ctx.wizard.next();
    },
    async (ctx) => {
      const amount = ctx.message.text;
      if (isNaN(amount)) {
        ctx.reply('Invalid Amount', {
          reply_to_message_id: ctx.message.message_id,
        });
        return ctx.scene.leave();
      }
      const price = ctx.wizard.state.price;
      ctx.wizard.state.tokenAmount = amount;
      const tokenName = ctx.wizard.state.tokenName;
      ctx.reply(
        CREATE_NEW_ORDER_AMOUNT.replace('<TOKEN-NAME>', tokenName).replace(
          '<PRICE>',
          price,
        ),
        { reply_to_message_id: ctx.message.message_id },
      );
      return ctx.wizard.next();
    },
    async (ctx) => {
      const price = ctx.message.text;
      if (isNaN(price)) {
        ctx.reply('Invalid Price', {
          reply_to_message_id: ctx.message.message_id,
        });
        return ctx.scene.leave();
      }
      const tokenName = ctx.wizard.state.tokenName;
      const tokenAmount = ctx.wizard.state.tokenAmount;
      ctx.reply(
        CREATE_NEW_ORDER_SUCCESS.replace('<TOKEN-NAME>', tokenName)
          .replace('<TOKEN-AMOUNT>', tokenAmount)
          .replace('<PRICE>', price),
        { reply_to_message_id: ctx.message.message_id },
      );
      return ctx.scene.leave();
    },
  );
}
