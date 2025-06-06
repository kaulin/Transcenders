import { useTranslation } from "react-i18next"

import peekingCat from "/images/peekingCat.avif"

const Profile = () => {
    const { t } = useTranslation()

    return (
        <div className="w-full h-full flex flex-col justify-center">
            <div className="profile-box basis-1/2 p-28 items-start">
                <div className="text-5xl font-fascinate mb-10 uppercase">
                    {t('settings')}
                </div>
                <div className="play-button min-w-48">{t('change_username')}</div>
                <div className="play-button min-w-48">{t('change_password')}</div>
                <div className="play-button min-w-48">{t('change_language')}</div>
                
                <img
                    src={peekingCat}
                    alt="peekingCat"
                    className="absolute top-0 right-0 -translate-y-[76.6%]
                    w-72 sm:w-96 lg:w-[400px] object-contain pointer-events-none"
                />
            </div>
        </div>
    )
}

export default Profile
