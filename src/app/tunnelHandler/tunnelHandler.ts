import { ipcMain } from 'electron';
import { ElectronWindow } from '../../common';
import { EventEmitter } from 'events';
class TunnelHandler extends EventEmitter {}
