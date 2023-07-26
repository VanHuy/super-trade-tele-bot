import { Test, TestingModule } from '@nestjs/testing';
import 'dotenv/config';
import { TestUtils } from './test.utils';
import { EmptyLogger } from './EmptyLogger';
import { GatewayRegistry } from 'src/blockchain/registries/GatewayRegistry';
import { BaseGateway } from 'src/blockchain/base.gateway';

describe('Web3Gateway', () => {
  const chain = {
    chainId: 97,
    address: '0x54B1E639C454CaE78b173CCA211f4B0EfA360fD2',
  };
  let module: TestingModule;
  let gateway: BaseGateway;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: TestUtils.INIT_MODULES,
      providers: TestUtils.INIT_PROVIDERS,
    }).compile();
    module.useLogger(new EmptyLogger());

    gateway = GatewayRegistry.getGatewayInstance(chain.chainId);
  });

  afterEach(async () => {
    await TestUtils.clearDB(module);
  });

  it('sign sucess', async () => {
    const sign = await gateway.sign(['data']);
    const address = await gateway.recover(['data'], sign);
    expect(address).toMatch(chain.address);
  });

  it('sign fail: empty data sign', async () => {
    try {
      await gateway.sign([]);
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });

  it('recover fail: wrong data sign', async () => {
    const sign = await gateway.sign(['data-1']);
    const address = await gateway.recover(['data-2'], sign);
    expect(address).not.toMatch(chain.address);
  });

  it('recover fail: wrong signature', async () => {
    await gateway.sign(['data']);
    const address = await gateway.recover(
      ['data'],
      '0xb91467e570a6466aa9e9876cbcd013baba02900b8979d43fe208a4a4f339f5fd6007e74cd82e037b800186422fc2da167c747ef045e5d18a5f5d4300f8e1a0291c',
    );
    expect(address).not.toMatch(chain.address);
  });
});
