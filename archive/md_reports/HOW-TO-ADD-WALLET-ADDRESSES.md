# 📝 How to Add Your Crypto Wallet Addresses

**Status**: Quick Guide  
**For**: When you're ready to start accepting donations  
**Time**: 5-10 minutes

---

## 🎯 Overview

Your donation page is live at `/donate.html`, but the wallet addresses are currently showing placeholders. When you set up your Proton Wallet (or other wallets), you'll need to add your actual addresses.

---

## 🔧 Step-by-Step Instructions

### Step 1: Get Your Wallet Addresses

1. **Set up Proton Wallet** (when available) or use:
   - **Nano**: Natrium wallet, Nault wallet
   - **Ethereum**: MetaMask, Coinbase Wallet, Trust Wallet
   - **Bitcoin**: Coinbase, Kraken, Electrum

2. **Find your receiving address** in each wallet:
   - Look for "Receive" button
   - Copy the address (long string of letters/numbers)
   - Save it somewhere safe

3. **Verify addresses**:
   - Send a tiny test amount ($1-5) to yourself
   - Confirm it arrives before publishing

---

### Step 2: Edit `donate.html`

Open the file and find these three sections (search for "Wallet address will be added soon"):

#### **Nano Address** (around line 262)

**FIND:**
```html
<div class="wallet-address-container">
    <div class="wallet-address-label">Nano Address:</div>
    <div class="wallet-address wallet-placeholder">
        Wallet address will be added soon
    </div>
</div>
```

**REPLACE WITH:**
```html
<div class="wallet-address-container">
    <div class="wallet-address-label">Nano Address:</div>
    <div class="wallet-address">
        nano_your_actual_address_here_from_natrium_or_nault
    </div>
</div>
```

---

#### **Ethereum Address** (around line 283)

**FIND:**
```html
<div class="wallet-address-container">
    <div class="wallet-address-label">Ethereum Address:</div>
    <div class="wallet-address wallet-placeholder">
        Wallet address will be added soon
    </div>
</div>
```

**REPLACE WITH:**
```html
<div class="wallet-address-container">
    <div class="wallet-address-label">Ethereum Address:</div>
    <div class="wallet-address">
        0xYourEthereumAddressHereFromMetaMaskOrCoinbase
    </div>
</div>
```

---

#### **Bitcoin Address** (around line 304)

**FIND:**
```html
<div class="wallet-address-container">
    <div class="wallet-address-label">Bitcoin Address:</div>
    <div class="wallet-address wallet-placeholder">
        Wallet address will be added soon
    </div>
</div>
```

**REPLACE WITH:**
```html
<div class="wallet-address-container">
    <div class="wallet-address-label">Bitcoin Address:</div>
    <div class="wallet-address">
        bc1YourBitcoinAddressHereFromCoinbaseOrKraken
    </div>
</div>
```

---

### Step 3: Remove Placeholder Styling

In all three replacements above, notice we removed `wallet-placeholder` class. This changes the text from gray/italic to normal black monospace font.

---

### Step 4: Test the Page

1. **Open `donate.html` in browser**
2. **Check that addresses display correctly**:
   - Should be in monospace font
   - Should be black text (not gray)
   - Should be copy-pasteable
3. **Test on mobile** to ensure addresses wrap properly

---

### Step 5: Verify Addresses Work

**Before going live:**

1. **Send test amounts** to each address from another wallet
2. **Confirm they arrive** in your wallet
3. **Double-check you have backup/recovery phrases** saved securely
4. **Test QR codes** (if you add them later)

---

## 📋 Address Format Examples

### Nano Address:
```
nano_3abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567
```
- Starts with `nano_`
- 60-65 characters long
- Alphanumeric

### Ethereum Address:
```
0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb6
```
- Starts with `0x`
- 42 characters long
- Hexadecimal (0-9, a-f, A-F)

### Bitcoin Address:
```
bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
```
- Modern format starts with `bc1`
- 42-62 characters
- Alphanumeric lowercase

---

## 🎨 Optional: Add QR Codes

If you want to add QR codes for easier mobile donations:

### 1. Generate QR Codes

Use a service like:
- **QR Code Generator**: https://www.qr-code-generator.com/
- **QRCode Monkey**: https://www.qrcode-monkey.com/
- **Bitcoin.com QR Generator**: https://www.bitcoin.com/tools/qr-code-generator/

### 2. Add to Page

Add below each address:

```html
<div class="wallet-address-container">
    <div class="wallet-address-label">Bitcoin Address:</div>
    <div class="wallet-address">
        bc1YourBitcoinAddressHere
    </div>
    
    <!-- Add QR Code -->
    <div style="text-align: center; margin-top: 1rem;">
        <img src="images/qr-bitcoin.png" alt="Bitcoin QR Code" style="max-width: 200px; border: 2px solid #E5E5E5; border-radius: 8px; padding: 0.5rem;">
        <p style="font-size: 0.875rem; color: #5A6C7D; margin-top: 0.5rem;">Scan to donate</p>
    </div>
</div>
```

---

## 🔒 Security Reminders

### ✅ DO:
- Use strong passwords for wallets
- Enable 2FA if available
- Save recovery phrases offline (paper, safe)
- Test with small amounts first
- Keep wallet software updated
- Use hardware wallet for large amounts

### ❌ DON'T:
- Share private keys (only share public addresses)
- Store recovery phrases digitally
- Use exchange addresses (use personal wallet)
- Forget to back up wallets
- Share wallet passwords

---

## 🚀 After Adding Addresses

### 1. Announce to Community

Consider posting:
- On social media
- In community forums
- Via newsletter (if you have one)

**Sample Message:**
> "🎉 Our donation page is now live! If you've found this project helpful and want to support continued development and community programs, you can now contribute via cryptocurrency. Every donation helps us keep this 100% free for everyone. Check it out: [your-site.com/donate.html]"

### 2. Monitor Donations

- Check wallets regularly
- Thank donors (if they contact you)
- Track in spreadsheet for transparency
- Consider quarterly community reports

### 3. Tax Considerations

- Consult a tax professional about crypto donations
- Keep records of all donations received
- Understand reporting requirements in your country

---

## 💡 Tips for Success

1. **Start Small**: Don't feel pressure to set up all three immediately
2. **Educate Donors**: The page already has great instructions
3. **Be Patient**: Crypto donations may start slow
4. **Stay Grateful**: Thank people genuinely
5. **Show Impact**: Share what donations enable (when comfortable)

---

## 🆘 Troubleshooting

### "I don't have Proton Wallet yet"
- **Solution**: Use Coinbase, Kraken, or other reputable wallets in the meantime
- Proton Wallet will support crypto when it launches

### "Which wallet should I start with?"
- **Recommendation**: Start with **Bitcoin** (most recognized)
- Add others as you become comfortable

### "Can I use exchange addresses?"
- **Not recommended**: Use personal wallet addresses you control
- Exchanges can close accounts, change addresses, etc.

### "What if someone sends to wrong address?"
- **Can't help**: Crypto transactions are irreversible
- Make sure addresses are clearly labeled

### "How do I convert crypto to money?"
- **Coinbase/Kraken**: Sell → withdraw to bank account
- **Bitcoin ATM**: Cash out directly (higher fees)
- **Peer-to-peer**: LocalBitcoins, etc.

---

## 📞 Need Help?

If you run into issues:

1. **Wallet Provider Support**: Most have excellent help centers
2. **Crypto Subreddits**: r/Bitcoin, r/Ethereum, r/nanocurrency
3. **Your Community**: Someone likely knows crypto

---

## 🎉 You've Got This!

Adding wallet addresses is the final step to accepting donations. Once complete:

- ✅ Your donation system is fully operational
- ✅ Supporters can contribute
- ✅ You can focus on building
- ✅ The dream of serving communities becomes real

**Remember**: Every journey starts with a first step. That first donation, no matter how small, is someone saying "I believe in what you're building."

---

**Good luck, and thank you for building something that helps people!** 💝

---

**Version**: V34.1.0  
**Last Updated**: January 25, 2025  
**Status**: Ready to Use
