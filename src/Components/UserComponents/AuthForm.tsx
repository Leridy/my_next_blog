import { useState } from 'react';
import { motion } from 'framer-motion';
import './UserModal.style.scss';

interface AuthFormProps {
  type: 'login' | 'register';
  onSubmit: (data: any) => void;
  loading?: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
  name?: string;
  password2?: string;
  validateCode?: string;
}

export default function AuthForm({ type, onSubmit, loading }: AuthFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    ...(type === 'register' && { name: '', password2: '' }),
    validateCode: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [randomKey, setRandomKey] = useState(Math.random());

  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };
    switch (name) {
      case 'email':
        if (!value) {
          newErrors.email = '邮箱不能为空';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = '请输入有效的邮箱地址';
        } else {
          delete newErrors.email;
        }
        break;

      case 'password':
        if (!value) {
          newErrors.password = '密码不能为空';
        } else if (value.length < 6) {
          newErrors.password = '密码至少需要6个字符';
        } else {
          delete newErrors.password;
        }
        break;

      case 'password2':
        if (value !== formData.password) {
          newErrors.password2 = '两次输入的密码不一致';
        } else {
          delete newErrors.password2;
        }
        break;

      case 'name':
        if (!value) {
          newErrors.name = '用户名不能为空';
        } else if (value.length < 2) {
          newErrors.name = '用户名至少需要2个字符';
        } else {
          delete newErrors.name;
        }
        break;

      case 'validateCode':
        if (!value) {
          newErrors.validateCode = '验证码不能为空';
        } else {
          delete newErrors.validateCode;
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleChangeValidateCode = () => {
    setRandomKey((prev) => prev + 1);
    setFormData((prev) => ({ ...prev, validateCode: '' }));
    setErrors((prev) => ({ ...prev, validateCode: undefined }));
  };

  const validateForm = () => {
    Object.keys(formData).forEach((key) => {
      validateField(key, formData[key as keyof typeof formData] || '');
    });
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="auth-form"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {type === 'register' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <label>用户名</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="请输入用户名"
            required
            className={errors.name ? 'error' : ''}
          />
          {errors.name && <div className="error-message">{errors.name}</div>}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: type === 'register' ? 0.2 : 0.1 }}
      >
        <label>邮箱</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="请输入邮箱"
          required
          className={errors.email ? 'error' : ''}
        />
        {errors.email && (
          <motion.div
            className="error-message"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {errors.email}
          </motion.div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: type === 'register' ? 0.3 : 0.2 }}
      >
        <label>密码</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="请输入密码"
          required
          minLength={6}
          maxLength={20}
          className={errors.password ? 'error' : ''}
        />
        {errors.password && (
          <motion.div
            className="error-message"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {errors.password}
          </motion.div>
        )}
      </motion.div>

      {type === 'register' && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <label>确认密码</label>
            <input
              type="password"
              name="password2"
              value={formData.password2}
              onChange={handleChange}
              placeholder="请再次输入密码"
              required
              className={errors.password2 ? 'error' : ''}
            />
            {errors.password2 && (
              <motion.div
                className="error-message"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {errors.password2}
              </motion.div>
            )}
          </motion.div>
        </>
      )}

      <motion.div
        className="validate-code-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: type === 'register' ? 0.5 : 0.3 }}
      >
        <div>
          <label>验证码</label>
          <input
            type="text"
            name="validateCode"
            value={formData.validateCode}
            onChange={handleChange}
            placeholder="请输入验证码"
            required
            className={errors.validateCode ? 'error' : ''}
          />
          {errors.validateCode && (
            <motion.div
              className="error-message"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {errors.validateCode}
            </motion.div>
          )}
        </div>
        <div
          className="validate-code-image"
          onClick={handleChangeValidateCode}
          style={{
            backgroundImage: `url(/api/image/validationCode?k=${randomKey})`,
          }}
        />
      </motion.div>

      <motion.div
        className="form-actions"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: type === 'register' ? 0.6 : 0.4 }}
      >
        <button
          type="submit"
          disabled={loading}
        >
          {loading ? '处理中...' : type === 'login' ? '登录' : '注册'}
        </button>
        <button
          type="button"
          onClick={() =>
            setFormData({
              email: '',
              password: '',
              ...(type === 'register' && { name: '', password2: '' }),
              validateCode: '',
            })
          }
        >
          重置
        </button>
      </motion.div>
    </motion.form>
  );
}
