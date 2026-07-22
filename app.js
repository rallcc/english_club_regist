// --- CONFIG & SUPABASE INITIALIZATION ---
let supabaseClient = null;

function initSupabase() {
    try {
        if (typeof CONFIG !== 'undefined' && CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY) {
            // Clean URL if '/rest/v1/' is accidentally appended
            const cleanUrl = CONFIG.SUPABASE_URL.replace(/\/rest\/v1\/?$/, '');
            
            if (window.supabase && typeof window.supabase.createClient === 'function') {
                supabaseClient = window.supabase.createClient(cleanUrl, CONFIG.SUPABASE_ANON_KEY);
            } else {
                console.warn("Supabase SDK is not loaded from CDN.");
            }
        } else {
            console.warn("Supabase credentials not configured in config.js.");
        }
    } catch (err) {
        console.error("Failed to initialize Supabase:", err);
    }
}

// Initialize on script load
initSupabase();

// --- DOM ELEMENTS ---
const form = document.getElementById('registrationForm');
const submitBtn = document.getElementById('submitBtn');
const btnText = submitBtn.querySelector('.btn-text');
const btnIcon = submitBtn.querySelector('.btn-icon');
const loader = submitBtn.querySelector('.loader');
const statusMessage = document.getElementById('statusMessage');

// --- EVENT LISTENERS ---
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Check database client initialization
        if (!supabaseClient) {
            showStatusMessage(
                'Database connection is not configured yet. Please check your Supabase credentials in config.js.',
                'error'
            );
            return;
        }

        // Extract and trim form data
        const formData = new FormData(form);
        const fullName = (formData.get('fullName') || '').trim();
        const studentClass = (formData.get('class') || '').trim();
        const phone = (formData.get('phone') || '').trim();
        const division = (formData.get('division') || '').trim();
        const reason = (formData.get('reason') || '').trim();

        // Client-side Validation
        if (!fullName || !studentClass || !phone || !division || !reason) {
            showStatusMessage('Please fill in all required fields.', 'error');
            return;
        }

        // UI State: Loading
        setLoadingState(true);
        hideStatusMessage();

        const payload = {
            full_name: fullName,
            class: studentClass,
            phone: phone,
            division: division,
            reason: reason,
            created_at: new Date().toISOString()
        };

        try {
            // Submit data to Supabase 'registrations' table
            const { error } = await supabaseClient
                .from('registrations')
                .insert([payload]);

            if (error) throw error;

            // Success State
            showStatusMessage('🎉 Registration successful! Welcome to English Club SMEA. We will contact you soon.', 'success');
            form.reset();

        } catch (error) {
            console.error('Error submitting form:', error);
            const msg = error.message || 'An error occurred during registration. Please try again later.';
            showStatusMessage(msg, 'error');
        } finally {
            // Reset UI Loading state
            setLoadingState(false);
        }
    });
}

// --- HELPER FUNCTIONS ---
function setLoadingState(isLoading) {
    if (isLoading) {
        submitBtn.disabled = true;
        btnText.classList.add('hidden');
        if (btnIcon) btnIcon.classList.add('hidden');
        loader.classList.remove('hidden');
        loader.classList.add('flex');
    } else {
        submitBtn.disabled = false;
        btnText.classList.remove('hidden');
        if (btnIcon) btnIcon.classList.remove('hidden');
        loader.classList.add('hidden');
        loader.classList.remove('flex');
    }
}

function showStatusMessage(message, type) {
    statusMessage.textContent = message;
    statusMessage.classList.remove('hidden');

    if (type === 'success') {
        statusMessage.className = 'mb-6 rounded-2xl p-4 text-sm font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-sm animate-fade-in flex items-center gap-2';
    } else if (type === 'error') {
        statusMessage.className = 'mb-6 rounded-2xl p-4 text-sm font-medium bg-rose-50 text-rose-800 border border-rose-200/80 shadow-sm animate-fade-in flex items-center gap-2';
    }
}

function hideStatusMessage() {
    statusMessage.textContent = '';
    statusMessage.className = 'hidden';
}