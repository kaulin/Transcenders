import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "../contexts/UserContext";

function Profile() {
  const { t } = useTranslation()
  const { user } = useUser()

  const [avatar, setAvatar] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <main>
        <div className="flex items-center justify-evenly text-text px-24 mt-32">
          <div className="flex items-center">
            <div>
            {previewUrl ? (
              <img
              src={previewUrl}
              alt="Avatar preview"
              className="bubble w-44 h-44"
              />
              ) : (
                <div className="bubble w-44 h-44 bg-white bg-opacity-25"></div>
                )}
            </div>
            <div>
            <h1 className="flex justify-center text-4xl">{user?.name}</h1>
          <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden"
              />

          <button
              onClick={handleUploadClick}
              className="px-4 text-[#ffebe7b7] hover:text-text py-2"
              >
            {t("avatar")}
          </button>
          </div>
          </div>
          <div className="flex items-center">
            <div>
              <h1 className="flex text-4xl">
                {t('games_played')}
              </h1>
              <div className="flex justify-evenly py-2 text-[#ffebe7b7]">
                <div>{t('wins')}</div>
                <div>{t('losses')}</div>
              </div>
            </div>
          </div>

        </div>
    {/* <div className="grid h-screen grid-cols-4 m-6 gap-6">
      <div className="row-span-2 rounded-lg bg-white bg-opacity-20 text-[#dcfaff]" >
          {previewUrl ? (
              <img
              src={previewUrl}
              alt="Avatar preview"
              className="w-40 h-40 mt-8 justify-center rounded-full object-cover mx-auto shadow"
              />
              ) : (
                  <div className="w-40 h-40 mt-8 justify-center rounded-full bg-[#dcfaff] mx-auto" />
                )}
            <h1 className="text-4xl">{user?.name}</h1>
            <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="hidden"
            />

            <button
                onClick={handleUploadClick}
                className="text-[#95e1ef] hover:text-text px-4 py-2"
                >
            {t("avatar")}
            </button>
            <h1 className="mt-10 text-3xl">{t('rank')}</h1>
      </div>
      <div className="col-span-2 rounded-lg bg-white bg-opacity-20 text-[#dcfaff]">
        <div className="grid grid-cols-3 h-full" >
        <p className="col-span-3 text-xl mt-8">{t('games_played')}</p>
        <div className="col-span-3">
          <div className="flex columns-3 justify-around">
            <div className="text-xl">{t('wins')} 28</div>
            <div className="text-xl">{t('total')} 42</div>
            <div className="text-xl">{t('losses')} 14</div>
          </div>
        </div>
          <div className="col-span-3">
            <div className="flex columns-3">
              <div className="w-32 h-32 mt-8 rounded-full bg-[#bdebf2] bg-opacity-50 mx-auto" />
              <div className="w-32 h-32 mt-8 rounded-full bg-[#bdebf2] bg-opacity-50 mx-auto" />
              <div className="w-32 h-32 mt-8 rounded-full bg-[#bdebf2] bg-opacity-50 mx-auto" />
            </div>
            </div>
        </div>
      </div>

      <div className="bg-white rounded-lg bg-opacity-20 row-span-2" >
      <p className="text-xl text-[#dcfaff] mt-8">{t('friends')}</p>
        </div>
      <div className="bg-white rounded-lg bg-opacity-20 col-span-2" >
      <p className="text-xl text-[#ecfcff] mt-8">{t('history')}</p>
        </div>
    </div> */}
  </main>
  );
}

export default Profile
