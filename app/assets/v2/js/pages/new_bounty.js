/* eslint-disable no-console */
/* eslint-disable nonblock-statement-body-position */
load_tokens();

/* Check if quickstart page is to be shown */
var localStorage;
var quickstartURL = document.location.origin + '/bounty/quickstart';

const FEE_PERCENTAGE = 10;

var new_bounty = {
  last_sync: new Date()
};

try {
  localStorage = window.localStorage;
} catch (e) {
  localStorage = {};
}

if (localStorage['quickstart_dontshow'] !== 'true' &&
    doShowQuickstart(document.referrer) &&
    doShowQuickstart(document.URL)) {
  window.location = quickstartURL;
}

function doShowQuickstart(url) {
  var fundingURL = document.location.origin + '/funding/new\\?';
  var bountyURL = document.location.origin + '/bounty/new\\?';
  var blacklist = [ fundingURL, bountyURL, quickstartURL ];

  for (var i = 0; i < blacklist.length; i++) {
    if (url.match(blacklist[i])) {
      return false;
    }
  }

  return true;
}

function lastSynced(current, last_sync) {
  var time = timeDifference(current, last_sync);

  return time;
}

$('#sync-issue').on('click', function(event) {
  event.preventDefault();
  if (!$('#sync-issue').hasClass('disabled')) {
    new_bounty.last_sync = new Date();
    retrieveIssueDetails();
    $('#last-synced span').html(lastSynced(new Date(), new_bounty.last_sync));
  }
});

$('#issueURL').focusout(function() {
  setInterval(function() {
    $('#last-synced span').html(timeDifference(new Date(), new_bounty.last_sync));
  }, 6000);

  if ($('input[name=issueURL]').val() == '' || !validURL($('input[name=issueURL]').val())) {
    $('#issue-details, #issue-details-edit').hide();
    $('#no-issue-banner').show();

    $('#title').val('');
    $('#description').val('');

    $('#last-synced').hide();
    $('.js-submit').addClass('disabled');
  } else {
    $('#no-issue-banner').hide();
    $('#edit-issue').attr('href', $('input[name=issueURL]').val());
    $('#issue-details, #issue-details-edit').show();

    $('#sync-issue').removeClass('disabled');
    $('.js-submit').removeClass('disabled');

    new_bounty.last_sync = new Date();
    retrieveIssueDetails();
    $('#last-synced').show();
    $('#last-synced span').html(lastSynced(new Date(), new_bounty.last_sync));
  }
});

$('#last-synced').hide();

$(document).ready(function() {

  $('#summary-bounty-amount').html($('input[name=amount]').val());
  $('#summary-fee-amount').html(($('input[name=amount]').val() / FEE_PERCENTAGE).toFixed(4));
  populateBountyTotal();

  // Load sidebar radio buttons from localStorage
  if (getParam('source')) {
    $('input[name=issueURL]').val(getParam('source'));
  } else if (getParam('url')) {
    $('input[name=issueURL]').val(getParam('url'));
  } else if (localStorage['issueURL']) {
    $('input[name=issueURL]').val(localStorage['issueURL']);
  }

  // fetch issue URL related info
  $('input[name=amount]').keyup(setUsdAmount);
  $('input[name=amount]').blur(setUsdAmount);
  $('input[name=usd_amount]').keyup(usdToAmount);
  $('input[name=usd_amount]').blur(usdToAmount);
  $('input[name=hours]').keyup(setUsdAmount);
  $('input[name=hours]').blur(setUsdAmount);
  $('select[name=denomination]').change(setUsdAmount);
  $('select[name=denomination]').change(promptForAuth);
  $('input[name=issueURL]').blur(retrieveIssueDetails);
  setTimeout(setUsdAmount, 1000);
  waitforWeb3(function() {
    promptForAuth();
  });
  $('select[name=permission_type]').on('change', function() {
    var val = $('select[name=permission_type] option:selected').val();

    if (val === 'approval') {
      $('#auto_approve_workers_container').show();
    } else {
      $('#auto_approve_workers_container').hide();
    }
  });

  $('input[name=amount]').on('change', function() {
    const amount = $('input[name=amount]').val();

    $('#summary-bounty-amount').html(amount);
    $('#summary-fee-amount').html((amount / FEE_PERCENTAGE).toFixed(4));
    populateBountyTotal();
  });

  $('select[name=denomination]').change(function(e) {
    const token = tokenAddressToDetails(e.target.value).name;

    $('#summary-bounty-token').html(token);
    $('#summary-fee-token').html(token);
    populateBountyTotal();
  });

  $('#featuredBounty').on('change', function() {
    if ($(this).prop('checked'))
      $('.feature-amount').show();
    else
      $('.feature-amount').hide();
    populateBountyTotal();
  });

  $('.js-select2[name=project_type]').change(
    function(e) {
      if (String(e.target.value).toLowerCase() === 'traditional') {
        $('#reservedForDiv').show();
      } else {
        $('#reservedForDiv').hide();
      }
    }
  );

  // revision action buttons
  $('#subtractAction').on('click', function() {
    var revision = parseInt($('input[name=revisions]').val());

    revision = revision - 1;
    if (revision > 0) {
      $('input[name=revisions]').val(revision);
    }
  });

  $('#addAction').on('click', function() {
    var revision = parseInt($('input[name=revisions]').val());

    revision = revision + 1;
    $('input[name=revisions]').val(revision);
  });

  if ($('input[name=issueURL]').val() != '') {
    retrieveIssueDetails();
  }
  $('input[name=issueURL]').focus();

  $('.js-select2').each(function() {
    $(this).select2();
  });

  $('.submit_bounty select').each(function(evt) {
    $('.select2-selection__rendered').removeAttr('title');
  });

  $('.select2-container').on('click', function() {
    $('.select2-container .select2-search__field').remove();
  });

  $('select[name=denomination]').select2();
  if ($('input[name=amount]').val().trim().length > 0) {
    setUsdAmount();
  }
  var open_hiring_panel = function(do_focus) {
    setTimeout(function() {
      var hiringRightNow = $('#hiringRightNow').is(':checked');

      if (hiringRightNow) {
        $('#jobDescription').removeClass('hidden');
        if (do_focus) {
          $('#jobDescription').focus();
        }
      } else {
        $('#jobDescription').addClass('hidden');
      }
    }, 10);
  };

  $('#hiringRightNow').on('click', function() {
    open_hiring_panel(true);
  });


  $('#advancedLink a').on('click', function(e) {
    e.preventDefault();
    var target = $('#advanced_container');

    if (target.css('display') == 'none') {
      target.css('display', 'block');
      $(this).text('Advanced ⬆');
    } else {
      target.css('display', 'none');
      $(this).text('Advanced ⬇ ');
    }
  });

  userSearch('#reservedFor', false);

  $('#submitBounty').validate({
    submitHandler: function(form) {
      try {
        bounty_address();
      } catch (exception) {
        _alert(gettext('You are on an unsupported network.  Please change your network to a supported network.'));
        return;
      }
      if (typeof qa != 'undefined') {
        ga('send', 'event', 'new_bounty', 'new_bounty_form_submit');
      }

      var data = {};
      var disabled = $(form)
        .find(':input:disabled')
        .removeAttr('disabled');

      $.each($(form).serializeArray(), function() {
        data[this.name] = this.value;
      });

      disabled.attr('disabled', 'disabled');

      // setup
      loading_button($('.js-submit'));
      var githubUsername = data.githubUsername;
      var issueURL = data.issueURL.replace(/#.*$/, '');
      var notificationEmail = data.notificationEmail;
      var amount = data.amount;
      var tokenAddress = data.denomination;
      var token = tokenAddressToDetails(tokenAddress);
      var decimals = token['decimals'];
      var tokenName = token['name'];
      var decimalDivisor = Math.pow(10, decimals);
      var expirationTimeDelta = data.expirationTimeDelta;
      let reservedFor = $('.username-search').select2('data')[0];

      var metadata = {
        issueTitle: data.title,
        issueDescription: data.description,
        issueKeywords: data.keywords ? data.keywords : '',
        githubUsername: data.githubUsername,
        notificationEmail: data.notificationEmail,
        fullName: data.fullName,
        experienceLevel: data.experience_level,
        projectLength: data.project_length,
        bountyType: data.bounty_type,
        estimatedHours: data.hours,
        fundingOrganisation: data.fundingOrganisation,
        is_featured: data.featuredBounty,
        featuring_date: data.featuredBounty && ((new Date().getTime() / 1000) | 0) || 0,
        reservedFor: reservedFor ? reservedFor.text : '',
        tokenName
      };

      var privacy_preferences = {
        show_email_publicly: data.show_email_publicly,
        show_name_publicly: data.show_name_publicly
      };

      var expire_date =
        parseInt(expirationTimeDelta) + ((new Date().getTime() / 1000) | 0);
      var mock_expire_date = 9999999999; // 11/20/2286, https://github.com/Bounties-Network/StandardBounties/issues/25

      // https://github.com/ConsenSys/StandardBounties/issues/21
      var ipfsBounty = {
        payload: {
          title: metadata.issueTitle,
          description: metadata.issueDescription,
          sourceFileName: '',
          sourceFileHash: '',
          sourceDirectoryHash: '',
          issuer: {
            name: metadata.fullName,
            email: metadata.notificationEmail,
            githubUsername: metadata.githubUsername,
            address: '' // Fill this in later
          },
          schemes: {
            project_type: data.project_type,
            permission_type: data.permission_type,
            auto_approve_workers: !!data.auto_approve_workers
          },
          hiring: {
            hiringRightNow: data.hiringRightNow,
            jobDescription: data.jobDescription
          },
          funding_organisation: metadata.fundingOrganisation,
          is_featured: metadata.is_featured,
          featuring_date: metadata.featuring_date,
          privacy_preferences: privacy_preferences,
          funders: [],
          categories: metadata.issueKeywords.split(','),
          created: (new Date().getTime() / 1000) | 0,
          webReferenceURL: issueURL,
          fee_amount: 0,
          fee_tx_id: "0x0",
          // optional fields
          metadata: metadata,
          tokenName: tokenName,
          tokenAddress: tokenAddress,
          expire_date: expire_date
        },
        meta: {
          platform: 'gitcoin',
          schemaVersion: '0.1',
          schemaName: 'gitcoinBounty'
        }
      };

      // validation
      var isError = false;

      $(this).attr('disabled', 'disabled');

      // save off local state for later
      localStorage['issueURL'] = issueURL;
      localStorage['notificationEmail'] = notificationEmail;
      localStorage['githubUsername'] = githubUsername;
      localStorage['tokenAddress'] = tokenAddress;
      localStorage.removeItem('bountyId');

      // setup web3
      // TODO: web3 is using the web3.js file.  In the future we will move
      // to the node.js package.  github.com/ethereum/web3.js
      var isETH = tokenAddress == '0x0000000000000000000000000000000000000000';
      var token_contract = web3.eth.contract(token_abi).at(tokenAddress);
      var account = web3.eth.coinbase;

      if (!isETH) {
        check_balance_and_alert_user_if_not_enough(tokenAddress, amount);
      }

      amount = amount * decimalDivisor;
      // Create the bounty object.
      // This function instantiates a contract from the existing deployed Standard Bounties Contract.
      // bounty_abi is a giant object containing the different network options
      // bounty_address() is a function that looks up the name of the network and returns the hash code
      var bounty = web3.eth.contract(bounty_abi).at(bounty_address());
      // StandardBounties integration begins here
      // Set up Interplanetary file storage
      // IpfsApi is defined in the ipfs-api.js.
      // Is it better to use this JS file than the node package?  github.com/ipfs/

      ipfs.ipfsApi = IpfsApi(ipfsConfig);
      ipfs.setProvider(ipfsConfig);

      // setup inter page state
      localStorage[issueURL] = JSON.stringify({
        timestamp: null,
        dataHash: null,
        issuer: account,
        txid: null
      });

      function syncDb() {
        // Need to pass the bountydetails as well, since I can't grab it from the
        // Standard Bounties contract.
        if (typeof dataLayer !== 'undefined') {
          dataLayer.push({ event: 'fundissue' });
        }

        // update localStorage issuePackage
        var issuePackage = JSON.parse(localStorage[issueURL]);

        issuePackage['timestamp'] = timestamp();
        localStorage[issueURL] = JSON.stringify(issuePackage);

        _alert({ message: gettext('Submission sent to web3.') }, 'info');
        setTimeout(() => {
          delete localStorage['issueURL'];
          document.location.href = '/funding/details/?url=' + issueURL;
        }, 1000);
      }

      // web3 callback
      function web3Callback(error, result) {
        if (error) {
          console.error(error);
          _alert(
            {
              message:
                gettext('There was an error.  Please try again or contact support.')
            },
            'error'
          );
          unloading_button($('.js-submit'));
          return;
        }

        if (typeof qa != 'undefined') {
          ga('send', 'event', 'new_bounty', 'metamask_signature_achieved');
        }


        // update localStorage issuePackage
        var issuePackage = JSON.parse(localStorage[issueURL]);

        issuePackage['txid'] = result;
        localStorage[issueURL] = JSON.stringify(issuePackage);

        syncDb();
      }

      function newIpfsCallback(error, result) {
        if (error) {
          console.error(error);
          _alert({
            message: gettext('There was an error.  Please try again or contact support.')
          }, 'error');
          unloading_button($('.js-submit'));
          return;
        }

        // cache data hash to find bountyId later
        // update localStorage issuePackage
        var issuePackage = JSON.parse(localStorage[issueURL]);

        issuePackage['dataHash'] = result;
        localStorage[issueURL] = JSON.stringify(issuePackage);

        // bounty is a web3.js eth.contract address
        // The Ethereum network requires using ether to do stuff on it
        // issueAndActivateBounty is a method defined in the StandardBounties solidity contract.

        var eth_amount = isETH ? amount : 0;
        var _paysTokens = !isETH;
        var bountyIndex = bounty.issueAndActivateBounty(
          account, // _issuer
          mock_expire_date, // _deadline
          result, // _data (ipfs hash)
          amount, // _fulfillmentAmount
          0x0, // _arbiter
          _paysTokens, // _paysTokens
          tokenAddress, // _tokenContract
          amount, // _value
          {
          // {from: x, to: y}
            from: account,
            value: eth_amount,
            gasPrice: web3.toHex($('#gasPrice').val() * Math.pow(10, 9)),
            gas: web3.toHex(318730),
            gasLimit: web3.toHex(318730)
          },
          web3Callback // callback for web3
        );
      }

      var do_bounty = function(callback) {
        const fee = Number((Number(data.amount) / FEE_PERCENTAGE).toFixed(4));
        const to_address = '0xC369225D0E3dF243299280c0358C0E6CF14557bD';
        const gas_price = web3.toHex($('#gasPrice').val() * Math.pow(10, 9));

        if (isETH) {
          web3.eth.sendTransaction({
            to: to_address,
            from: web3.eth.coinbase,
            value: web3.toWei(fee, 'ether'),
            gasPrice: gas_price
          }, function(error, txnId) {
            if (error) {
              _alert({ message: gettext('Unable to pay bounty fee. Please try again.') }, 'error');
            } else {
              // TODO: Save txnId + feeamount + fee% to bounty;
              ipfsBounty.payload.issuer.address = account;
              ipfsBounty.payload.fee_tx_id = txnId;
              ipfsBounty.payload.fee_amount = fee;
              ipfs.addJson(ipfsBounty, newIpfsCallback);
            }
          });
        } else {
          const amountInWei = fee * 1.0 * Math.pow(10, token.decimals);
          const token_contract = web3.eth.contract(token_abi).at(tokenAddress);

          token_contract.transfer(to_address, amountInWei, { gasPrice: gas_price },
            function(error, txnId) {
              if (error) {
                _alert({ message: gettext('Unable to pay bounty fee. Please try again.') }, 'error');
              } else {
              // TODO: Save txnId + feeamount + fee% to bounty;
                ipfsBounty.payload.issuer.address = account;
                ipfsBounty.payload.fee_tx_id = txnId;
                ipfsBounty.payload.fee_amount = fee;
                ipfs.addJson(ipfsBounty, newIpfsCallback);
              }
            }
          );
        }
      };

      const payFeaturedBounty = function() {
        web3.eth.sendTransaction({
          to: '0x00De4B13153673BCAE2616b67bf822500d325Fc3',
          from: web3.eth.coinbase,
          value: web3.toWei(ethFeaturedPrice, 'ether'),
          gasPrice: web3.toHex($('#gasPrice').val() * Math.pow(10, 9)),
          gas: web3.toHex(318730),
          gasLimit: web3.toHex(318730)
        },
        function(error, result) {
          saveAttestationData(
            result,
            ethFeaturedPrice,
            '0x00De4B13153673BCAE2616b67bf822500d325Fc3',
            'featuredbounty'
          );
          do_bounty();
        });
      };

      if (data.featuredBounty) {
        payFeaturedBounty();
      } else {
        do_bounty();
      }
    }
  });
});

var check_balance_and_alert_user_if_not_enough = function(tokenAddress, amount) {
  var token_contract = web3.eth.contract(token_abi).at(tokenAddress);
  var from = web3.eth.coinbase;
  var token_details = tokenAddressToDetails(tokenAddress);
  var token_decimals = token_details['decimals'];
  var token_name = token_details['name'];

  token_contract.balanceOf.call(from, function(error, result) {
    if (error) return;
    var balance = result.toNumber() / Math.pow(10, token_decimals);
    var balance_rounded = Math.round(balance * 10) / 10;
    const total = parseFloat(amount) + parseFloat((parseFloat(amount) / FEE_PERCENTAGE).toFixed(4));

    if (parseFloat(total) > balance) {
      var msg = gettext('You do not have enough tokens to fund this bounty. You have ') + balance_rounded + ' ' + token_name + ' ' + gettext(' but you need ') + amount + ' ' + token_name;

      _alert(msg, 'warning');
    }
  });
};

let usdFeaturedPrice = $('.featured-price-usd').text();
let ethFeaturedPrice;
let bountyFee;

getAmountEstimate(usdFeaturedPrice, 'ETH', (amountEstimate) => {
  ethFeaturedPrice = amountEstimate['value'];
  $('.featured-price-eth').text(`+${amountEstimate['value']} ETH`);
  $('#summary-feature-amount').text(`${amountEstimate['value']}`);
});

/**
 * Calculates total amount needed to fund the bounty
 * Bounty Amount + Fee + Featured Bounty
 */
const populateBountyTotal = () => {
  const bountyToken = $('#summary-bounty-token').html();
  const bountyAmount = Number($('#summary-bounty-amount').html());
  const bountyFee = Number((bountyAmount / FEE_PERCENTAGE).toFixed(4));
  const isFeaturedBounty = $('input[name=featuredBounty]:checked').val();
  let totalBounty = bountyAmount + bountyFee;
  let total = '';

  if (isFeaturedBounty) {
    const featuredBountyAmount = Number($('#summary-feature-amount').html());

    if (bountyToken == 'ETH') {
      totalBounty = (totalBounty + featuredBountyAmount).toFixed(4);
      total = `${totalBounty} ETH`;
    } else {
      total = `${totalBounty} ${bountyToken} + ${featuredBountyAmount} ETH`;
    }
  } else {
    total = `${totalBounty} ${bountyToken}`;
  }

  $('#fee-percentage').html(FEE_PERCENTAGE);
  $('#fee-amount').html(bountyFee);
  $('#fee-token').html(bountyToken);
  $('#summary-total-amount').html(total);
};
