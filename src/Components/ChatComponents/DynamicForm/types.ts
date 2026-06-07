import { Configuration } from '@/IndexedDB/AIChat/types';

export interface ConfigFormProps {
  configurations: Configuration[];
  onAdd: (config: Omit<Configuration, 'id'>) => Promise<string>;
  onUpdate: (id: string, updates: Partial<Configuration>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export interface ConfigEditorModalProps {
  config: Configuration | null;
  visible: boolean;
  onSave: (config: Configuration) => Promise<unknown>;
  onCancel: () => void;
}

export interface ConfigEditorModalRef {
  open: (config?: Configuration) => Promise<Configuration | undefined>;
}

export interface ConfigCardProps {
  config: Configuration;
  onEdit: () => void;
  onDelete: () => void;
}
