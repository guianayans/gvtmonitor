import fs from 'fs/promises';
import { NodeSSH } from 'node-ssh';
import { env, requiredEnvMessage } from './env';

const DEFAULT_TIMEOUT = 12000;

// Serviço responsável por abrir e reutilizar uma conexão SSH para executar comandos rápidos.
class SSHService {
  private ssh = new NodeSSH();
  private connecting?: Promise<void>;

  private async buildConfig(): Promise<Record<string, any>> {
    if (!env.serverHost || !env.serverUser) {
      throw new Error(requiredEnvMessage);
    }

    const config: Record<string, any> = {
      host: env.serverHost,
      port: env.serverPort || 22,
      username: env.serverUser,
      readyTimeout: DEFAULT_TIMEOUT,
    };

    if (env.serverKeyPath) {
      try {
        config.privateKey = await fs.readFile(env.serverKeyPath, 'utf8');
      } catch (err) {
        throw new Error(`Não foi possível ler a chave em SERVER_KEY_PATH (${env.serverKeyPath}).`);
      }
    } else if (env.serverPassword) {
      config.password = env.serverPassword;
    } else {
      throw new Error('Defina SERVER_KEY_PATH ou SERVER_PASSWORD para autenticação SSH.');
    }

    return config;
  }

  private async ensureConnection(): Promise<void> {
    if (this.ssh.isConnected()) return;
    if (!this.connecting) {
      this.connecting = this.connect().finally(() => {
        this.connecting = undefined;
      });
    }
    return this.connecting;
  }

  private async connect(): Promise<void> {
    const config = await this.buildConfig();
    await this.ssh.connect(config);
  }

  async exec(command: string): Promise<string> {
    await this.ensureConnection();

    // Corrida entre o comando SSH e um timeout simples para evitar travamentos.
    const commandPromise = this.ssh.execCommand(command);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('SSH command timeout')), DEFAULT_TIMEOUT)
    );

    try {
      const result = (await Promise.race([commandPromise, timeoutPromise])) as Awaited<
        ReturnType<NodeSSH['execCommand']>
      >;

      if (result.stderr && result.stderr.trim()) {
        throw new Error(result.stderr.trim());
      }

      return result.stdout.trim();
    } catch (err) {
      // attempt to recover connection on next call
      this.ssh.dispose();
      throw err;
    }
  }

  async execMany(commands: string[]): Promise<string[]> {
    const outputs: string[] = [];
    for (const cmd of commands) {
      outputs.push(await this.exec(cmd));
    }
    return outputs;
  }
}

export const sshService = new SSHService();
