/**
 * BookPage — full-page appointment booking
 */
import BookAppointment from '../components/BookAppointment'

export default function BookPage({ onSuccess }) {
  return <BookAppointment onSuccess={onSuccess} />
}
