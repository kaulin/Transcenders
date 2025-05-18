import { useTranslation } from "react-i18next"
import { useUser } from "../contexts/UserContext"

function Home() {
    const { t } = useTranslation()
    const { user } = useUser()

    return (
        <main className="h-full w-full flex-1 flex justify-center mt-80">
            <div>
                <h1 className="text-4xl">{t('hello')} {user?.name} </h1>
                <p className="text-text mb-8">{t('welcome')}!</p>
                <div className="flex flex-col">
                    <button className="rounded-full bg-gradient-to-t from-[#ffddd6b7] to-[#b192ff78] p-4 button-text mt-6">
                        {t('start_match')}
                    </button>
                    <button className="rounded-full bg-gradient-to-t from-[#ffddd6b7] to-[#b192ff78] p-4 button-text mt-4">
                        {t('start_tournament')}
                </button>
                </div>
            </div>
        </main>
    )
}

export default Home
