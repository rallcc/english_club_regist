const { SUPABASE_URL, SUPABASE_ANON_KEY } = CONFIG;

let supabaseClient = null;

try {
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
        // Bersihkan URL jika ada '/rest/v1/' di belakangnya
        const cleanUrl = SUPABASE_URL.replace('/rest/v1/', '').replace('/rest/v1', '');

        // Pastikan window.supabase tersedia (load CDN di HTML)
        supabaseClient = window.supabase.createClient(cleanUrl, SUPABASE_ANON_KEY);
    } else {
        console.error("Konfigurasi Supabase tidak ditemukan!");
    }
} catch (err) {
    console.error("Gagal menginisialisasi Supabase:", err);
}

// --- SELEKSI ELEMEN DOM ---
const form = document.getElementById('registrationForm');
const submitBtn = document.getElementById('submitBtn');
const btnText = submitBtn.querySelector('.btn-text');
const loader = submitBtn.querySelector('.loader');
const statusMessage = document.getElementById('statusMessage');

// --- EVENT LISTENER ---
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1. Validasi awal
    if (!supabaseClient) {
        showStatusMessage('Koneksi database gagal. Periksa konfigurasi.', 'error');
        return;
    }

    // 2. UI State: Loading
    setLoadingState(true);
    hideStatusMessage();

    // 3. Ambil data dari form
    const formData = new FormData(form);
    const data = {
        full_name: formData.get('fullName'),
        class: formData.get('class'),
        phone: formData.get('phone'),
        division: formData.get('division'),
        reason: formData.get('reason'),
        created_at: new Date().toISOString()
    };

    try {
        // 4. Kirim data ke tabel 'registrations'
        const { error } = await supabaseClient
            .from('registrations')
            .insert([data]);

        if (error) throw error;

        // 5. Success State
        showStatusMessage('Registrasi berhasil! Sampai jumpa di English Club.', 'success');
        form.reset();

    } catch (error) {
        console.error('Error submitting form:', error);
        showStatusMessage(error.message || 'Terjadi kesalahan. Coba lagi nanti.', 'error');
    } finally {
        // 6. UI State: Selesai
        setLoadingState(false);
    }
});

// --- HELPER FUNCTIONS ---
function setLoadingState(isLoading) {
    if (isLoading) {
        submitBtn.disabled = true;
        btnText.classList.add('hidden');
        loader.classList.remove('hidden');
    } else {
        submitBtn.disabled = false;
        btnText.classList.remove('hidden');
        loader.classList.add('hidden');
    }
}

function showStatusMessage(message, type) {
    statusMessage.textContent = message;

    // Set Tailwind classes directly
    if (type === 'success') {
        statusMessage.className = 'rounded-xl p-4 text-base font-medium bg-green-50 text-green-800 border border-green-200 mt-6';
    } else if (type === 'error') {
        statusMessage.className = 'rounded-xl p-4 text-base font-medium bg-red-50 text-red-800 border border-red-200 mt-6';
    }
}

function hideStatusMessage() {
    statusMessage.className = 'hidden';
}