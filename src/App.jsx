import { useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import MarketTrends from './components/MarketTrends'
import AccountingTools from './components/AccountingTools'
import Testimonials from './components/Testimonials'
import Footer from './components/Footer'
import WaitlistModal from './components/WaitlistModal'

export default function App() {
  const [modalOpen, setModalOpen] = useState(false)

  const openModal = () => setModalOpen(true)
  const closeModal = () => setModalOpen(false)

  return (
    <div className="font-dagular min-h-screen">
      <Navbar onOpenWaitlist={openModal} />
      <Hero onOpenWaitlist={openModal} />
      <Features />
      <MarketTrends />
      <AccountingTools />
      <Testimonials />
      <Footer onOpenWaitlist={openModal} />
      <WaitlistModal isOpen={modalOpen} onClose={closeModal} />
    </div>
  )
}
