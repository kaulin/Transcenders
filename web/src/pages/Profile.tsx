import { ApiClient } from '@transcenders/api-client';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';

import { ServiceError, UpdateUserRequest } from '@transcenders/contracts';
import AvatarPicker from '../components/AvatarPicker';
import ElevationSection from '../components/Elevation';
import TwoFactorSection from '../components/TwoFactorSection';
import { useTokenElevation } from '../hooks/useTokenElevation';

const Profile = () => {
  const { t } = useTranslation();
  const { setUser, user, updateUser } = useUser();
  const { isElevated } = useTokenElevation();

  const navigate = useNavigate();

  const [username, setUsername] = useState(user?.username ?? '');
  const [displayName, setDisplayName] = useState(user?.display_name ?? '');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [language, setLanguage] = useState(user?.lang ?? '');
  const [deleteUser, setDeleteUser] = useState<boolean>(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    setUsername(user.username ?? '');
    setDisplayName(user.display_name ?? '');
    setLanguage(user.lang ?? '');
    setPassword('');
    setRepeatPassword('');
  }, [user]);

  const handleConfirm = async () => {
    setDeleteUser(false);
    setSuccess(null);
    setError(null);
    
    if (!user) return;

    if (password !== repeatPassword) {
      setError(t('pw_no_match'));
      return;
    }

    const userData: UpdateUserRequest = {
      username,
      display_name: displayName,
      lang: language,
    };

    try {
      await updateUser(userData);
      if (password) {
        await ApiClient.auth.changePassword(user.id, password);
        window.dispatchEvent(new Event('userCredsChanged'));
      }
      
      setSuccess(t('changes_saved'));
      
    } catch (err: unknown) {
      if (err instanceof ServiceError) {
        setError(t(err.localeKey ?? 'something_went_wrong'));
      } else {
        setError(t('something_went_wrong'));
      }
    }
  };

  const handleDelete = async () => {
    setDeleteUser(false);
    setSuccess(null);
    setError(null);
    
    if (!user) return;

    try {
      await ApiClient.user.deleteUser(user.id);
      
      setSuccess(t('deletion_successful'));

      setTimeout(() => {
        setUser(null);
        navigate('/login');
      }, 2000);
      
    } catch (err: unknown) {
      if (err instanceof ServiceError) {
        setError(t(err.localeKey ?? 'something_went_wrong'));
      } else {
        setError(t('something_went_wrong'));
      }
    }
  };

  return (
    <div className="box xl:gap-4">
      {!isElevated && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
          <div className="absolute inset-0 backdrop-blur-xs transition-opacity duration-200" />

          <div className="relative z-10 w-full max-w-2xl p-6 rounded-xl bg-[#e29760]/35 backdrop-blur-xs border-3 border-white/60 ">
            <ElevationSection />
          </div>
        </div>
      )}
      <div
        className={`box-section ${!isElevated ? 'blur-[3px]' : ''} bg-[#6e5d41]/10 justify-center gap-10`}
      >
        {/* avatar section */}
        <AvatarPicker className="flex flex-col items-center" />
      </div>
      <div
        className={`box-section ${!isElevated ? 'blur-[3px]' : ''} bg-[#6e5d41]/10 justify-center gap-12`}
      >
        {/* User Info section */}
        <div className="w-full max-w-md">
          <label className="fascinate-label">{t('username')}</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input-field"
            disabled={!isElevated}
          />
        </div>
        <div className="w-full max-w-md">
          <label className="fascinate-label">{t('display_name')}</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="input-field"
            disabled={!isElevated}
          />
        </div>
        <div className="w-full max-w-md">
          <label className="fascinate-label">{t('two_fac_auth')}</label>
          <TwoFactorSection />
        </div>
        <div className="w-full max-w-md">
          <label className="fascinate-label">{t('password')}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            placeholder={t('new_pw')}
            className="input-field"
            disabled={!isElevated}
          />
          <input
            type="password"
            value={repeatPassword}
            onChange={(e) => {
              setRepeatPassword(e.target.value);
            }}
            placeholder={t('repeat_pw')}
            className={`input-field ${
              password === repeatPassword ? 'text-white' : 'text-white/40'
            } text-lg placeholder-white/60`}
            disabled={!isElevated}
          />
        </div>
        <div className="w-full max-w-md">
          <label className="fascinate-label">{t('language')}</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full bg-transparent border-b-2 border-white focus:outline-hidden focus:border-white/70 text-white text-lg"
            disabled={!isElevated}
          >
            <option value="en" className="bg-white text-[#786647]">
              {t('english')}
            </option>
            <option value="fi" className="bg-white text-[#786647]">
              {t('finnish')}
            </option>
            <option value="et" className="bg-white text-[#786647]">
              {t('estonian')}
            </option>
          </select>
        </div>
        <div className="flex flex-col gap-4 items-center">
          <button
            onClick={handleConfirm}
            className="rounded-button w-[282px] bg-[#6e5d41]/15 font-fascinate uppercase"
            disabled={!isElevated}
            >
            {t('confirm')}
          </button>
          <button
            onClick={() => {
              setDeleteUser(true);
              setSuccess(null);
              setError(null);
            }}
            className="rounded-button w-[282px] bg-[#6e5d41]/15 font-fascinate uppercase"
            disabled={!isElevated}
            >
            {t('delete_account')}
          </button>

          <div className="h-6 w-full text-center">
            {success && <p className="tsc-info-message">{t(success)}</p>}
            {error && <p className="tsc-error-message">{t(error)}</p>}
            {deleteUser && (
              <div className="flex flex-col items-center gap-2">
                <p className="tsc-info-message">{t('confirm_acc_del')}</p>
                <div className="flex gap-4">
                  <button onClick={handleDelete} >
                    {t('yes')}
                  </button>
                  <button onClick={() => setDeleteUser(false)} >
                    {t('no')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
