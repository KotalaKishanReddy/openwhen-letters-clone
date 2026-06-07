// Open envelope on click
function openLetter(envelope) {
  if (envelope.classList.contains('opened')) return;
  // Flip animation
  envelope.style.transition = 'transform .35s ease';
  envelope.style.transform = 'scale(0.96)';
  setTimeout(() => {
    envelope.classList.add('opened');
    envelope.style.transform = '';
    // Animate letter content in
    const inner = envelope.querySelector('.letter-inside');
    inner.style.animation = 'letterOpen .4s ease';
  }, 160);
}

// Close letter back to envelope
function closeLetter(e, btn) {
  e.stopPropagation();
  const envelope = btn.closest('.envelope');
  envelope.classList.remove('opened');
}

// Inject keyframes
const s = document.createElement('style');
s.textContent = `
@keyframes letterOpen {
  from { opacity: 0; transform: translateY(10px) scale(.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}`;
document.head.appendChild(s);
