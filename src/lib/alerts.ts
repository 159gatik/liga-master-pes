import Swal from 'sweetalert2';

export const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: '#1a1a1a',
    color: '#ffffff',
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
});

export const Alert = Swal.mixin({
    background: '#111',
    color: '#fff',
    confirmButtonColor: '#c9a84c',
    cancelButtonColor: '#333',
    customClass: {
        popup: 'border border-[#222] font-barlow-condensed',
        title: 'font-bebas italic text-2xl tracking-widest',
        confirmButton: 'font-bebas uppercase italic px-8',
        cancelButton: 'font-bebas uppercase italic px-8'
    }
});